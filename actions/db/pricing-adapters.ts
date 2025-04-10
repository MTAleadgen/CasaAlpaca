"use server"

import { db } from "@/db/db"
import { ActionState } from "@/types"
import postgres from "postgres"

/**
 * Fetches the baseline pricing rule for a property
 */
export async function getPricingRuleAction(
  propertyId: string
): Promise<ActionState<any>> {
  try {
    const client = postgres(process.env.DATABASE_URL!)
    
    const rules = await client`
      SELECT * FROM pricing_rules 
      WHERE property_id = ${propertyId} 
      AND type = 'baseline' 
      LIMIT 1
    `
    
    if (rules.length === 0) {
      return {
        isSuccess: false,
        message: "No pricing rule found for this property"
      }
    }
    
    // Map from DB schema to our API format
    const rule = rules[0]
    
    return {
      isSuccess: true,
      message: "Pricing rule retrieved successfully",
      data: {
        id: rule.id,
        propertyId: rule.property_id,
        baseWeekdayRate: rule.baseline_weekday_price,
        baseWeekendRate: rule.baseline_weekend_price,
        isEnabled: rule.is_enabled
      }
    }
  } catch (error) {
    console.error("Error fetching pricing rule:", error)
    return {
      isSuccess: false,
      message: "Failed to fetch pricing rule"
    }
  }
}

/**
 * Updates the baseline pricing rule for a property
 */
export async function updatePricingRuleAction(
  propertyId: string,
  data: {
    baseWeekdayRate?: number
    baseWeekendRate?: number
  }
): Promise<ActionState<any>> {
  try {
    const client = postgres(process.env.DATABASE_URL!)
    
    // First, check if a rule exists
    const existingRules = await client`
      SELECT id FROM pricing_rules 
      WHERE property_id = ${propertyId} 
      AND type = 'baseline' 
      LIMIT 1
    `
    
    if (existingRules.length === 0) {
      // If no rule exists, create one
      await client`
        INSERT INTO pricing_rules (
          property_id, 
          type, 
          baseline_weekday_price, 
          baseline_weekend_price, 
          is_enabled,
          created_at,
          updated_at
        ) 
        VALUES (
          ${propertyId}, 
          'baseline', 
          ${data.baseWeekdayRate || 10000}, 
          ${data.baseWeekendRate || 15000}, 
          ${true},
          now(),
          now()
        )
      `
      
      return {
        isSuccess: true,
        message: "Pricing rule created successfully",
        data: {
          propertyId,
          baseWeekdayRate: data.baseWeekdayRate || 10000,
          baseWeekendRate: data.baseWeekendRate || 15000
        }
      }
    } else {
      // If rule exists, update it
      const fieldUpdates: any = {}
      
      if (data.baseWeekdayRate !== undefined) {
        fieldUpdates.baseline_weekday_price = data.baseWeekdayRate
      }
      
      if (data.baseWeekendRate !== undefined) {
        fieldUpdates.baseline_weekend_price = data.baseWeekendRate
      }
      
      fieldUpdates.updated_at = new Date()
      
      const [rule] = await client`
        UPDATE pricing_rules
        SET ${client(fieldUpdates)}
        WHERE property_id = ${propertyId} AND type = 'baseline'
        RETURNING id, property_id, baseline_weekday_price, baseline_weekend_price
      `
      
      return {
        isSuccess: true,
        message: "Pricing rule updated successfully",
        data: {
          id: rule.id,
          propertyId: rule.property_id,
          baseWeekdayRate: rule.baseline_weekday_price,
          baseWeekendRate: rule.baseline_weekend_price
        }
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
 * Gets all pricing seasons for a property
 */
export async function getPricingSeasonsAction(
  propertyId: string
): Promise<ActionState<any[]>> {
  try {
    const client = postgres(process.env.DATABASE_URL!)
    
    const seasons = await client`
      SELECT * FROM pricing_seasons 
      WHERE property_id = ${propertyId}
      ORDER BY start_date ASC
    `
    
    // Map from DB schema to our API format
    const mappedSeasons = seasons.map(season => ({
      id: season.id,
      propertyId: season.property_id,
      name: season.name,
      startDate: season.start_date,
      endDate: season.end_date,
      weekdayRate: season.weekday_rate,
      weekendRate: season.weekend_rate
    }))
    
    return {
      isSuccess: true,
      message: "Pricing seasons retrieved successfully",
      data: mappedSeasons
    }
  } catch (error) {
    console.error("Error fetching pricing seasons:", error)
    return {
      isSuccess: false,
      message: "Failed to fetch pricing seasons"
    }
  }
}

/**
 * Gets all price overrides for a property
 */
export async function getPriceOverridesAction(
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<ActionState<any[]>> {
  try {
    const client = postgres(process.env.DATABASE_URL!)
    
    let overrides
    
    if (startDate && endDate) {
      overrides = await client`
        SELECT * FROM price_overrides 
        WHERE property_id = ${propertyId}
        AND date >= ${startDate}
        AND date <= ${endDate}
        ORDER BY date ASC
      `
    } else {
      overrides = await client`
        SELECT * FROM price_overrides 
        WHERE property_id = ${propertyId}
        ORDER BY date ASC
      `
    }
    
    // Map from DB schema to our API format
    const mappedOverrides = overrides.map(override => ({
      id: override.id,
      propertyId: override.property_id,
      date: override.date,
      price: override.price,
      reason: override.reason
    }))
    
    return {
      isSuccess: true,
      message: "Price overrides retrieved successfully",
      data: mappedOverrides
    }
  } catch (error) {
    console.error("Error fetching price overrides:", error)
    return {
      isSuccess: false,
      message: "Failed to fetch price overrides"
    }
  }
} 