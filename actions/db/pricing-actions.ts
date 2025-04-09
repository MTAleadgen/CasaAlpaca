"use server"

import { db } from "@/db/db"
import {
  extrasTable,
  InsertPriceOverride,
  InsertPricingRule,
  InsertPricingSeason,
  priceOverridesTable,
  pricingRulesTable,
  pricingSeasonsTable,
  SelectPriceOverride,
  SelectPricingRule,
  SelectPricingSeason
} from "@/db/schema"
import { ActionState } from "@/types"
import { and, between, eq, inArray, or, gte, lte, not } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { calculateNights, formatDateToISODate, getDatesInRange, isWeekend } from "@/lib/utils"

interface PriceBreakdown {
  baseRate: number
  subtotal: number
  losDiscount: number
  extras: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  extrasTotal: number
  taxes: number
  total: number
  nightlyRates: Array<{
    date: string
    rate: number
    type: "base" | "weekend" | "seasonal" | "override"
  }>
}

/**
 * Calculate the price for a booking
 * This implements the dynamic pricing engine logic
 * 
 * @param propertyId The property ID
 * @param checkInDate Check-in date
 * @param checkOutDate Check-out date
 * @param numGuests Number of guests (might affect pricing)
 * @param extraIds Array of extra IDs to include
 * @returns ActionState with price breakdown
 */
export async function calculatePriceAction(
  propertyId: string,
  checkInDate: Date,
  checkOutDate: Date,
  numGuests: number,
  extraIds: string[] = []
): Promise<ActionState<PriceBreakdown>> {
  try {
    // Get all the pricing data we need
    const nights = calculateNights(checkInDate, checkOutDate)
    
    if (nights <= 0) {
      return {
        isSuccess: false,
        message: "Check-out date must be after check-in date"
      }
    }
    
    // Get pricing rules (base weekday/weekend rates and LOS discount)
    const pricingRule = await getPricingRule(propertyId)
    
    if (!pricingRule) {
      return {
        isSuccess: false,
        message: "No pricing rules found for this property"
      }
    }
    
    // Get seasons that overlap with the date range
    const seasons = await getOverlappingSeasons(propertyId, checkInDate, checkOutDate)
    
    // Get any price overrides within the date range
    const overrides = await getDateOverrides(propertyId, checkInDate, checkOutDate)
    
    // Get selected extras
    const extras = extraIds.length > 0
      ? await db.query.extras.findMany({
          where: and(
            inArray(extrasTable.id, extraIds),
            eq(extrasTable.isActive, true)
          )
        })
      : []
    
    // Calculate price for each night
    const datesInRange = getDatesInRange(checkInDate, new Date(checkOutDate.getTime() - 1)) // Exclude checkout day
    const nightlyRates: Array<{ date: string; rate: number; type: "base" | "weekend" | "seasonal" | "override" }> = []
    let subtotal = 0
    
    datesInRange.forEach(date => {
      const dateStr = formatDateToISODate(date)
      // First check if there's an override
      const override = overrides.find(o => formatDateToISODate(new Date(o.date)) === dateStr)
      
      if (override) {
        subtotal += override.price
        nightlyRates.push({ date: dateStr, rate: override.price, type: "override" })
        return
      }
      
      // Then check if there's a season
      const applicableSeason = seasons.find(season => {
        const seasonStart = new Date(season.startDate)
        const seasonEnd = new Date(season.endDate)
        return date >= seasonStart && date <= seasonEnd
      })
      
      if (applicableSeason) {
        const rate = isWeekend(date) ? applicableSeason.weekendRate : applicableSeason.weekdayRate
        subtotal += rate
        nightlyRates.push({ date: dateStr, rate, type: "seasonal" })
        return
      }
      
      // Otherwise use base rates
      const rate = isWeekend(date) ? pricingRule.baseWeekendRate : pricingRule.baseWeekdayRate
      subtotal += rate
      nightlyRates.push({ date: dateStr, rate, type: isWeekend(date) ? "weekend" : "base" })
    })
    
    // Calculate LOS discount if eligible
    let losDiscount = 0
    if (nights >= (pricingRule.losDiscountThreshold || 0)) {
      losDiscount = pricingRule.losDiscountAmount || 0
    }
    
    // Calculate extras total
    const extrasWithQuantity = extraIds.map(id => {
      const extra = extras.find(e => e.id === id)
      return {
        id,
        name: extra?.name || "Unknown",
        price: extra?.price || 0,
        quantity: 1 // Default to 1, could be customized later
      }
    })
    
    const extrasTotal = extrasWithQuantity.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
    
    // For now, we're not calculating taxes, but you could add tax calculation here
    const taxes = 0
    
    // Calculate total
    const total = subtotal - losDiscount + extrasTotal + taxes
    
    const priceBreakdown: PriceBreakdown = {
      baseRate: pricingRule.baseWeekdayRate, // Just for reference
      subtotal,
      losDiscount,
      extras: extrasWithQuantity,
      extrasTotal,
      taxes,
      total,
      nightlyRates
    }
    
    return {
      isSuccess: true,
      message: "Price calculated successfully",
      data: priceBreakdown
    }
  } catch (error) {
    console.error("Error calculating price:", error)
    return {
      isSuccess: false,
      message: "Failed to calculate price"
    }
  }
}

/**
 * Get the pricing rule for a property
 * There should be only one rule per property
 */
async function getPricingRule(propertyId: string): Promise<SelectPricingRule | null> {
  const rules = await db.query.pricingRules.findMany({
    where: eq(pricingRulesTable.propertyId, propertyId),
    limit: 1
  })
  
  return rules.length > 0 ? rules[0] : null
}

/**
 * Get seasons that overlap with a date range
 */
async function getOverlappingSeasons(propertyId: string, startDate: Date, endDate: Date): Promise<SelectPricingSeason[]> {
  // Convert dates to ISO format for Postgres
  const startIso = formatDateToISODate(startDate)
  const endIso = formatDateToISODate(endDate)
  
  return await db.query.pricingSeasons.findMany({
    where: and(
      eq(pricingSeasonsTable.propertyId, propertyId),
      or(
        // Start date falls within the requested range
        and(
          gte(pricingSeasonsTable.startDate, startIso),
          lte(pricingSeasonsTable.startDate, endIso)
        ),
        // End date falls within the requested range
        and(
          gte(pricingSeasonsTable.endDate, startIso),
          lte(pricingSeasonsTable.endDate, endIso)
        ),
        // Season completely contains the requested range
        and(
          lte(pricingSeasonsTable.startDate, startIso),
          gte(pricingSeasonsTable.endDate, endIso)
        )
      )
    )
  })
}

/**
 * Get price overrides within a date range
 */
async function getDateOverrides(propertyId: string, startDate: Date, endDate: Date): Promise<SelectPriceOverride[]> {
  // Convert dates to ISO format for Postgres
  const startIso = formatDateToISODate(startDate)
  const endIso = formatDateToISODate(endDate)
  
  return await db.query.priceOverrides.findMany({
    where: and(
      eq(priceOverridesTable.propertyId, propertyId),
      and(
        gte(priceOverridesTable.date, startIso),
        lte(priceOverridesTable.date, endIso)
      )
    )
  })
}

// ======== ADMIN PRICING MANAGEMENT ACTIONS ========

/**
 * Get pricing rules for a property (ADMIN)
 * 
 * @param propertyId The property ID
 * @returns ActionState with pricing rule
 */
export async function getPricingRulesAction(
  propertyId: string
): Promise<ActionState<SelectPricingRule | null>> {
  try {
    const rule = await getPricingRule(propertyId)
    
    return {
      isSuccess: true,
      message: "Pricing rules retrieved successfully",
      data: rule
    }
  } catch (error) {
    console.error("Error getting pricing rules:", error)
    return {
      isSuccess: false,
      message: "Failed to get pricing rules"
    }
  }
}

/**
 * Update pricing rules for a property (ADMIN ONLY)
 * 
 * @param propertyId The property ID
 * @param data New pricing rule data
 * @returns ActionState with updated pricing rule
 */
export async function updatePricingRuleAction(
  propertyId: string,
  data: Partial<InsertPricingRule>
): Promise<ActionState<SelectPricingRule>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    // Check if rule exists
    const existingRule = await getPricingRule(propertyId)
    
    if (existingRule) {
      // Update existing rule
      const [updatedRule] = await db
        .update(pricingRulesTable)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(pricingRulesTable.id, existingRule.id))
        .returning()
      
      return {
        isSuccess: true,
        message: "Pricing rule updated successfully",
        data: updatedRule
      }
    } else {
      // Create new rule
      const [newRule] = await db
        .insert(pricingRulesTable)
        .values({
          propertyId,
          baseWeekdayRate: data.baseWeekdayRate || 10000, // Default $100
          baseWeekendRate: data.baseWeekendRate || 15000, // Default $150
          losDiscountThreshold: data.losDiscountThreshold || 2,
          losDiscountAmount: data.losDiscountAmount || 3000, // Default $30
        })
        .returning()
      
      return {
        isSuccess: true,
        message: "Pricing rule created successfully",
        data: newRule
      }
    }
  } catch (error) {
    console.error("Error updating pricing rule:", error)
    return {
      isSuccess: false,
      message: "Failed to update pricing rule"
    }
  }
}

/**
 * Get pricing seasons for a property (ADMIN)
 * 
 * @param propertyId The property ID
 * @returns ActionState with pricing seasons
 */
export async function getPricingSeasonsAction(
  propertyId: string
): Promise<ActionState<SelectPricingSeason[]>> {
  try {
    const seasons = await db.query.pricingSeasons.findMany({
      where: eq(pricingSeasonsTable.propertyId, propertyId),
      orderBy: (seasons, { asc }) => [asc(seasons.startDate)]
    })
    
    return {
      isSuccess: true,
      message: "Pricing seasons retrieved successfully",
      data: seasons
    }
  } catch (error) {
    console.error("Error getting pricing seasons:", error)
    return {
      isSuccess: false,
      message: "Failed to get pricing seasons"
    }
  }
}

/**
 * Create a pricing season (ADMIN ONLY)
 * 
 * @param data The season data
 * @returns ActionState with created season
 */
export async function createSeasonAction(
  data: InsertPricingSeason
): Promise<ActionState<SelectPricingSeason>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    // Convert data dates to proper format
    const startDate = formatDateToISODate(typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate)
    const endDate = formatDateToISODate(typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate)
    
    // Check if season dates overlap with existing seasons
    const overlappingSeasons = await db.query.pricingSeasons.findMany({
      where: and(
        eq(pricingSeasonsTable.propertyId, data.propertyId),
        or(
          and(
            gte(pricingSeasonsTable.startDate, startDate),
            lte(pricingSeasonsTable.startDate, endDate)
          ),
          and(
            gte(pricingSeasonsTable.endDate, startDate),
            lte(pricingSeasonsTable.endDate, endDate)
          ),
          and(
            lte(pricingSeasonsTable.startDate, startDate),
            gte(pricingSeasonsTable.endDate, endDate)
          )
        )
      )
    })
    
    if (overlappingSeasons.length > 0) {
      return {
        isSuccess: false,
        message: "Season dates overlap with existing seasons"
      }
    }
    
    const [newSeason] = await db
      .insert(pricingSeasonsTable)
      .values(data)
      .returning()
    
    return {
      isSuccess: true,
      message: "Season created successfully",
      data: newSeason
    }
  } catch (error) {
    console.error("Error creating season:", error)
    return {
      isSuccess: false,
      message: "Failed to create season"
    }
  }
}

/**
 * Update a pricing season (ADMIN ONLY)
 * 
 * @param seasonId The season ID
 * @param data Updated season data
 * @returns ActionState with updated season
 */
export async function updateSeasonAction(
  seasonId: string,
  data: Partial<InsertPricingSeason>
): Promise<ActionState<SelectPricingSeason>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    const season = await db.query.pricingSeasons.findFirst({
      where: eq(pricingSeasonsTable.id, seasonId)
    })
    
    if (!season) {
      return {
        isSuccess: false,
        message: "Season not found"
      }
    }
    
    // If we're updating dates, check for overlaps
    if (data.startDate || data.endDate) {
      const startDate = formatDateToISODate(
        data.startDate 
          ? (typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate) 
          : new Date(season.startDate)
      )
      
      const endDate = formatDateToISODate(
        data.endDate 
          ? (typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate) 
          : new Date(season.endDate)
      )
      
      // Check if updated dates overlap with other seasons
      const overlappingSeasons = await db.query.pricingSeasons.findMany({
        where: and(
          eq(pricingSeasonsTable.propertyId, season.propertyId),
          not(eq(pricingSeasonsTable.id, seasonId)), // Exclude the current season
          or(
            and(
              gte(pricingSeasonsTable.startDate, startDate),
              lte(pricingSeasonsTable.startDate, endDate)
            ),
            and(
              gte(pricingSeasonsTable.endDate, startDate),
              lte(pricingSeasonsTable.endDate, endDate)
            ),
            and(
              lte(pricingSeasonsTable.startDate, startDate),
              gte(pricingSeasonsTable.endDate, endDate)
            )
          )
        )
      })
      
      if (overlappingSeasons.length > 0) {
        return {
          isSuccess: false,
          message: "Updated season dates would overlap with existing seasons"
        }
      }
    }
    
    const [updatedSeason] = await db
      .update(pricingSeasonsTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(pricingSeasonsTable.id, seasonId))
      .returning()
    
    return {
      isSuccess: true,
      message: "Season updated successfully",
      data: updatedSeason
    }
  } catch (error) {
    console.error("Error updating season:", error)
    return {
      isSuccess: false,
      message: "Failed to update season"
    }
  }
}

/**
 * Delete a pricing season (ADMIN ONLY)
 * 
 * @param seasonId The season ID
 * @returns ActionState with success/failure
 */
export async function deleteSeasonAction(
  seasonId: string
): Promise<ActionState<void>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    await db
      .delete(pricingSeasonsTable)
      .where(eq(pricingSeasonsTable.id, seasonId))
    
    return {
      isSuccess: true,
      message: "Season deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting season:", error)
    return {
      isSuccess: false,
      message: "Failed to delete season"
    }
  }
}

/**
 * Get price overrides for a property
 * 
 * @param propertyId The property ID
 * @param startDate Optional start date to filter
 * @param endDate Optional end date to filter
 * @returns ActionState with price overrides
 */
export async function getPriceOverridesAction(
  propertyId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActionState<SelectPriceOverride[]>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    let query = db.query.priceOverrides.findMany({
      where: eq(priceOverridesTable.propertyId, propertyId),
      orderBy: (overrides, { asc }) => [asc(overrides.date)]
    })
    
    // If date range provided, filter by it
    if (startDate && endDate) {
      const startIso = formatDateToISODate(startDate)
      const endIso = formatDateToISODate(endDate)
      
      query = db.query.priceOverrides.findMany({
        where: and(
          eq(priceOverridesTable.propertyId, propertyId),
          and(
            gte(priceOverridesTable.date, startIso),
            lte(priceOverridesTable.date, endIso)
          )
        ),
        orderBy: (overrides, { asc }) => [asc(overrides.date)]
      })
    }
    
    const overrides = await query
    
    return {
      isSuccess: true,
      message: "Price overrides retrieved successfully",
      data: overrides
    }
  } catch (error) {
    console.error("Error getting price overrides:", error)
    return {
      isSuccess: false,
      message: "Failed to get price overrides"
    }
  }
}

/**
 * Create a price override (ADMIN ONLY)
 * 
 * @param data The override data
 * @returns ActionState with created override
 */
export async function createOverrideAction(
  data: InsertPriceOverride
): Promise<ActionState<SelectPriceOverride>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    // Check if override already exists for this date
    const existingOverride = await db.query.priceOverrides.findFirst({
      where: and(
        eq(priceOverridesTable.propertyId, data.propertyId),
        eq(priceOverridesTable.date, data.date)
      )
    })
    
    if (existingOverride) {
      // If exists, update instead
      return updateOverrideAction(existingOverride.id, data)
    }
    
    const [newOverride] = await db
      .insert(priceOverridesTable)
      .values(data)
      .returning()
    
    return {
      isSuccess: true,
      message: "Price override created successfully",
      data: newOverride
    }
  } catch (error) {
    console.error("Error creating price override:", error)
    return {
      isSuccess: false,
      message: "Failed to create price override"
    }
  }
}

/**
 * Update a price override (ADMIN ONLY)
 * 
 * @param overrideId The override ID
 * @param data Updated override data
 * @returns ActionState with updated override
 */
export async function updateOverrideAction(
  overrideId: string,
  data: Partial<InsertPriceOverride>
): Promise<ActionState<SelectPriceOverride>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    const [updatedOverride] = await db
      .update(priceOverridesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(priceOverridesTable.id, overrideId))
      .returning()
    
    if (!updatedOverride) {
      return {
        isSuccess: false,
        message: "Price override not found"
      }
    }
    
    return {
      isSuccess: true,
      message: "Price override updated successfully",
      data: updatedOverride
    }
  } catch (error) {
    console.error("Error updating price override:", error)
    return {
      isSuccess: false,
      message: "Failed to update price override"
    }
  }
}

/**
 * Delete a price override (ADMIN ONLY)
 * 
 * @param overrideId The override ID
 * @returns ActionState with success/failure
 */
export async function deleteOverrideAction(
  overrideId: string
): Promise<ActionState<void>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    await db
      .delete(priceOverridesTable)
      .where(eq(priceOverridesTable.id, overrideId))
    
    return {
      isSuccess: true,
      message: "Price override deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting price override:", error)
    return {
      isSuccess: false,
      message: "Failed to delete price override"
    }
  }
} 