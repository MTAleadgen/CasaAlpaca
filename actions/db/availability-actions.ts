"use server"

import { db } from "@/db/db"
import {
  availabilityBlocksTable,
  bookingStatusEnum,
  bookingsTable,
  InsertAvailabilityBlock,
  SelectAvailabilityBlock,
  propertiesTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { and, between, eq, gte, lte, not, or } from "drizzle-orm"
import { formatDateToISODate } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"

interface AvailabilityPeriod {
  startDate: Date
  endDate: Date
  reason?: string
  source: string
  id: string
}

interface AvailabilityResult {
  bookedDates: Date[]
  blockedDates: Date[]
  availabilityPeriods: AvailabilityPeriod[]
}

/**
 * Get availability for a property within a date range
 * This combines bookings and blocks to determine which dates are unavailable
 * 
 * @param propertyId The property ID to check availability for
 * @param startDate Start of the date range to check
 * @param endDate End of the date range to check
 * @returns ActionState with availability data
 */
export async function getAvailabilityAction(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionState<AvailabilityResult>> {
  try {
    // Ensure dates are in ISO format for Postgres comparison
    const startIso = formatDateToISODate(startDate)
    const endIso = formatDateToISODate(endDate)
    const formattedStartDate = new Date(startIso)
    const formattedEndDate = new Date(endIso)

    // Get confirmed bookings that overlap with the date range
    const bookings = await db.query.bookings.findMany({
      where: and(
        eq(bookingsTable.propertyId, propertyId),
        eq(bookingsTable.status, "confirmed"),
        or(
          and(
            gte(bookingsTable.checkInDate, formattedStartDate),
            lte(bookingsTable.checkInDate, formattedEndDate)
          ),
          and(
            gte(bookingsTable.checkOutDate, formattedStartDate),
            lte(bookingsTable.checkOutDate, formattedEndDate)
          ),
          and(
            lte(bookingsTable.checkInDate, formattedStartDate),
            gte(bookingsTable.checkOutDate, formattedEndDate)
          )
        )
      )
    })

    // Get availability blocks that overlap with the date range
    const blocks = await db.query.availabilityBlocks.findMany({
      where: and(
        eq(availabilityBlocksTable.propertyId, propertyId),
        or(
          and(
            gte(availabilityBlocksTable.startDate, formattedStartDate),
            lte(availabilityBlocksTable.startDate, formattedEndDate)
          ),
          and(
            gte(availabilityBlocksTable.endDate, formattedStartDate),
            lte(availabilityBlocksTable.endDate, formattedEndDate)
          ),
          and(
            lte(availabilityBlocksTable.startDate, formattedStartDate),
            gte(availabilityBlocksTable.endDate, formattedEndDate)
          )
        )
      )
    })

    // Consolidate dates into arrays
    const bookedDates: Date[] = []
    const blockedDates: Date[] = []
    const availabilityPeriods: AvailabilityPeriod[] = []

    // Process bookings
    bookings.forEach(booking => {
      // Convert timestamps to dates for consistent processing
      const checkIn = new Date(booking.checkInDate)
      const checkOut = new Date(booking.checkOutDate)
      
      // Add to availabilityPeriods
      availabilityPeriods.push({
        startDate: checkIn,
        endDate: checkOut,
        reason: "Booking",
        source: booking.bookingSource,
        id: booking.id
      })

      // Add each date in range to bookedDates
      const currentDate = new Date(checkIn)
      while (currentDate < checkOut) {
        bookedDates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    // Process blocks
    blocks.forEach(block => {
      // Convert timestamps to dates for consistent processing
      const start = new Date(block.startDate)
      const end = new Date(block.endDate)
      
      // Add to availabilityPeriods
      availabilityPeriods.push({
        startDate: start,
        endDate: end,
        reason: block.reason || undefined,
        source: block.source,
        id: block.id
      })

      // Add each date in range to blockedDates
      const currentDate = new Date(start)
      while (currentDate <= end) {
        blockedDates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return {
      isSuccess: true,
      message: "Availability retrieved successfully",
      data: {
        bookedDates,
        blockedDates,
        availabilityPeriods
      }
    }
  } catch (error) {
    console.error("Error getting availability:", error)
    return {
      isSuccess: false,
      message: "Failed to get availability"
    }
  }
}

/**
 * Get the first property ID
 * Helper function used when no property ID is specified
 * Useful for single property sites
 * 
 * @returns First property ID or undefined
 */
export async function getFirstPropertyId(): Promise<string | undefined> {
  try {
    const properties = await db.query.properties.findMany({
      limit: 1
    })
    
    return properties[0]?.id
  } catch (error) {
    console.error("Error getting first property:", error)
    return undefined
  }
}

/**
 * Check if dates are available for a property
 * 
 * @param propertyId Property ID
 * @param startDate Start date to check
 * @param endDate End date to check
 * @returns ActionState with boolean indicating availability
 */
export async function checkAvailabilityAction(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionState<boolean>> {
  try {
    if (!propertyId) {
      propertyId = await getFirstPropertyId() || ""
      
      if (!propertyId) {
        return {
          isSuccess: false,
          message: "No property found"
        }
      }
    }
    
    // Format dates for query
    const startIso = formatDateToISODate(startDate)
    const endIso = formatDateToISODate(endDate)
    const formattedStartDate = new Date(startIso)
    const formattedEndDate = new Date(endIso)
    
    // Check for overlapping bookings (that aren't cancelled)
    const overlappingBookings = await db.query.bookings.findMany({
      where: and(
        eq(bookingsTable.propertyId, propertyId),
        not(eq(bookingsTable.status, "cancelled")),
        or(
          // Start date falls within a booking
          and(
            lte(bookingsTable.checkInDate, formattedStartDate),
            gte(bookingsTable.checkOutDate, formattedStartDate)
          ),
          // End date falls within a booking
          and(
            lte(bookingsTable.checkInDate, formattedEndDate),
            gte(bookingsTable.checkOutDate, formattedEndDate)
          ),
          // New range completely contains a booking
          and(
            gte(bookingsTable.checkInDate, formattedStartDate),
            lte(bookingsTable.checkOutDate, formattedEndDate)
          )
        )
      )
    })
    
    if (overlappingBookings.length > 0) {
      return {
        isSuccess: true,
        message: "Dates are not available due to existing bookings",
        data: false
      }
    }
    
    // Check for availability blocks
    const overlappingBlocks = await db.query.availabilityBlocks.findMany({
      where: and(
        eq(availabilityBlocksTable.propertyId, propertyId),
        or(
          // Start date falls within a block
          and(
            lte(availabilityBlocksTable.startDate, formattedStartDate),
            gte(availabilityBlocksTable.endDate, formattedStartDate)
          ),
          // End date falls within a block
          and(
            lte(availabilityBlocksTable.startDate, formattedEndDate),
            gte(availabilityBlocksTable.endDate, formattedEndDate)
          ),
          // New range completely contains a block
          and(
            gte(availabilityBlocksTable.startDate, formattedStartDate),
            lte(availabilityBlocksTable.endDate, formattedEndDate)
          )
        )
      )
    })
    
    if (overlappingBlocks.length > 0) {
      return {
        isSuccess: true,
        message: "Dates are not available due to availability blocks",
        data: false
      }
    }
    
    return {
      isSuccess: true,
      message: "Dates are available",
      data: true
    }
  } catch (error) {
    console.error("Error checking availability:", error)
    return {
      isSuccess: false,
      message: "Failed to check availability"
    }
  }
}

/**
 * Create an availability block
 * 
 * @param propertyId Property ID
 * @param startDate Start date
 * @param endDate End date
 * @param reason Reason for blocking (optional)
 * @returns ActionState with created block
 */
export async function createAvailabilityBlockAction(
  propertyId: string,
  startDate: Date,
  endDate: Date,
  reason?: string
): Promise<ActionState<unknown>> {
  try {
    // User must be authenticated for this action
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    if (!propertyId) {
      propertyId = await getFirstPropertyId() || ""
      
      if (!propertyId) {
        return {
          isSuccess: false,
          message: "No property found"
        }
      }
    }
    
    // Format dates for proper comparison
    const formattedStartDate = new Date(formatDateToISODate(startDate))
    const formattedEndDate = new Date(formatDateToISODate(endDate))
    
    // Check if there are any overlapping bookings
    const availability = await checkAvailabilityAction(propertyId, formattedStartDate, formattedEndDate)
    
    if (!availability.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to check availability"
      }
    }
    
    if (!availability.data) {
      return {
        isSuccess: false,
        message: "Cannot create block - dates overlap with existing bookings or blocks"
      }
    }
    
    // Create the availability block
    const [newBlock] = await db
      .insert(availabilityBlocksTable)
      .values({
        propertyId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        reason: reason || "Manual block",
        source: "manual"
      })
      .returning()
    
    return {
      isSuccess: true,
      message: "Availability block created successfully",
      data: newBlock
    }
  } catch (error) {
    console.error("Error creating availability block:", error)
    return {
      isSuccess: false,
      message: "Failed to create availability block"
    }
  }
}

/**
 * Delete an availability block
 * 
 * @param blockId Block ID
 * @returns ActionState with success status
 */
export async function deleteAvailabilityBlockAction(
  blockId: string
): Promise<ActionState<void>> {
  try {
    // User must be authenticated for this action
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    // Check if the block exists and is not from a booking
    const block = await db.query.availabilityBlocks.findFirst({
      where: eq(availabilityBlocksTable.id, blockId)
    })
    
    if (!block) {
      return {
        isSuccess: false,
        message: "Block not found"
      }
    }
    
    if (block.source === "direct_booking") {
      return {
        isSuccess: false,
        message: "Cannot delete block created from a booking"
      }
    }
    
    // Delete the block
    await db
      .delete(availabilityBlocksTable)
      .where(eq(availabilityBlocksTable.id, blockId))
    
    return {
      isSuccess: true,
      message: "Availability block deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting availability block:", error)
    return {
      isSuccess: false,
      message: "Failed to delete availability block"
    }
  }
}

/**
 * Get availability blocks for a property
 * 
 * @param propertyId Property ID
 * @param startDate Start date for the range
 * @param endDate End date for the range
 * @returns ActionState with availability blocks
 */
export async function getAvailabilityBlocksAction(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionState<unknown[]>> {
  try {
    if (!propertyId) {
      propertyId = await getFirstPropertyId() || ""
      
      if (!propertyId) {
        return {
          isSuccess: false,
          message: "No property found"
        }
      }
    }
    
    // Format dates for query
    const startIso = formatDateToISODate(startDate)
    const endIso = formatDateToISODate(endDate)
    const formattedStartDate = new Date(startIso)
    const formattedEndDate = new Date(endIso)
    
    const blocks = await db.query.availabilityBlocks.findMany({
      where: and(
        eq(availabilityBlocksTable.propertyId, propertyId),
        or(
          // Start date falls within the requested range
          and(
            gte(availabilityBlocksTable.startDate, formattedStartDate),
            lte(availabilityBlocksTable.startDate, formattedEndDate)
          ),
          // End date falls within the requested range
          and(
            gte(availabilityBlocksTable.endDate, formattedStartDate),
            lte(availabilityBlocksTable.endDate, formattedEndDate)
          ),
          // Block completely contains the requested range
          and(
            lte(availabilityBlocksTable.startDate, formattedStartDate),
            gte(availabilityBlocksTable.endDate, formattedEndDate)
          )
        )
      ),
      orderBy: (blocks, { asc }) => [asc(blocks.startDate)]
    })
    
    return {
      isSuccess: true,
      message: "Availability blocks retrieved successfully",
      data: blocks
    }
  } catch (error) {
    console.error("Error getting availability blocks:", error)
    return {
      isSuccess: false,
      message: "Failed to get availability blocks"
    }
  }
}

/**
 * Update an availability block
 * 
 * @param blockId Block ID
 * @param startDate New start date (optional)
 * @param endDate New end date (optional)
 * @param reason New reason (optional)
 * @returns ActionState with updated block
 */
export async function updateAvailabilityBlockAction(
  blockId: string,
  startDate?: Date,
  endDate?: Date,
  reason?: string
): Promise<ActionState<unknown>> {
  try {
    // User must be authenticated for this action
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    
    // Check if the block exists and is not from a booking
    const block = await db.query.availabilityBlocks.findFirst({
      where: eq(availabilityBlocksTable.id, blockId)
    })
    
    if (!block) {
      return {
        isSuccess: false,
        message: "Block not found"
      }
    }
    
    if (block.source === "direct_booking") {
      return {
        isSuccess: false,
        message: "Cannot update block created from a booking"
      }
    }
    
    // If dates are being updated, check for overlap
    if (startDate || endDate) {
      const newStartDate = startDate 
        ? new Date(formatDateToISODate(startDate)) 
        : block.startDate
      
      const newEndDate = endDate 
        ? new Date(formatDateToISODate(endDate)) 
        : block.endDate
      
      // Check if there are any overlapping bookings or blocks
      const availability = await checkAvailabilityAction(
        block.propertyId,
        newStartDate,
        newEndDate
      )
      
      if (!availability.isSuccess) {
        return {
          isSuccess: false,
          message: "Failed to check availability"
        }
      }
      
      // If not available and it's not just this block, return an error
      if (!availability.data) {
        // Get all blocks that overlap the new dates
        const overlappingBlocks = await db.query.availabilityBlocks.findMany({
          where: and(
            eq(availabilityBlocksTable.propertyId, block.propertyId),
            not(eq(availabilityBlocksTable.id, blockId)),
            or(
              // Start date falls within a block
              and(
                lte(availabilityBlocksTable.startDate, newStartDate),
                gte(availabilityBlocksTable.endDate, newStartDate)
              ),
              // End date falls within a block
              and(
                lte(availabilityBlocksTable.startDate, newEndDate),
                gte(availabilityBlocksTable.endDate, newEndDate)
              ),
              // New range completely contains a block
              and(
                gte(availabilityBlocksTable.startDate, newStartDate),
                lte(availabilityBlocksTable.endDate, newEndDate)
              )
            )
          )
        })
        
        if (overlappingBlocks.length > 0) {
          return {
            isSuccess: false,
            message: "Cannot update block - dates overlap with existing bookings or blocks"
          }
        }
      }
    }
    
    // Update the block
    const updateData: any = {}
    
    if (startDate) updateData.startDate = new Date(formatDateToISODate(startDate))
    if (endDate) updateData.endDate = new Date(formatDateToISODate(endDate))
    if (reason) updateData.reason = reason
    
    const [updatedBlock] = await db
      .update(availabilityBlocksTable)
      .set(updateData)
      .where(eq(availabilityBlocksTable.id, blockId))
      .returning()
    
    return {
      isSuccess: true,
      message: "Availability block updated successfully",
      data: updatedBlock
    }
  } catch (error) {
    console.error("Error updating availability block:", error)
    return {
      isSuccess: false,
      message: "Failed to update availability block"
    }
  }
}

/**
 * Sync iCal calendars from VRBO and Airbnb
 * This fetches and parses iCal feeds, creating availability blocks
 * 
 * @returns ActionState with sync results
 */
export async function syncIcalCalendarsAction(): Promise<ActionState<{ added: number, updated: number, errors: number }>> {
  try {
    // Get auth session to check for admin access if needed
    // For an automated task, this might be triggered by a cron job
    // and not have a user context
    
    const propertyId = await getFirstPropertyId()
    
    if (!propertyId) {
      return {
        isSuccess: false,
        message: "No property found to sync calendars for"
      }
    }
    
    // TODO: Get iCal URLs from env vars
    const vrboIcalUrl = process.env.VRBO_ICAL_URL
    const airbnbIcalUrl = process.env.AIRBNB_ICAL_URL
    
    if (!vrboIcalUrl && !airbnbIcalUrl) {
      return {
        isSuccess: false,
        message: "No iCal URLs configured"
      }
    }
    
    // Placeholder for the actual sync implementation
    // In a real implementation, we would:
    // 1. Fetch the iCal feeds using fetch() or a library like node-ical
    // 2. Parse the events
    // 3. For each event, check if we already have a block with that external ID
    // 4. Create or update blocks accordingly
    
    // This is a simplified implementation for now
    const results = {
      added: 0,
      updated: 0,
      errors: 0
    }
    
    return {
      isSuccess: true,
      message: "Calendar sync completed",
      data: results
    }
  } catch (error) {
    console.error("Error syncing iCal calendars:", error)
    return {
      isSuccess: false,
      message: "Failed to sync iCal calendars"
    }
  }
}

export async function getAvailabilityStatsAction(
  userId: string,
  propertyId: string
): Promise<ActionState<unknown[]>> {
  try {
    const property = await db.query.properties.findFirst({
      where: eq(propertiesTable.id, propertyId),
      columns: {
        id: true
      }
    })

    if (!property) {
      return {
        isSuccess: false,
        message: "Property not found"
      }
    }

    const blocks = await db.query.availabilityBlocks.findMany({
      where: eq(availabilityBlocksTable.propertyId, propertyId),
      columns: {
        startDate: true,
        endDate: true,
        source: true
      }
    })

    // Calculate stats based on blocks
    // This is a placeholder for actual logic
    return {
      isSuccess: true,
      message: "Stats retrieved successfully",
      data: []
    }
  } catch (error) {
    console.error("Error getting availability stats:", error)
    return {
      isSuccess: false,
      message: "Failed to get availability stats"
    }
  }
}

export async function getAvailabilityForPeriodAction(
  userId: string,
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionState<unknown[]>> {
  try {
    const property = await db.query.properties.findFirst({
      where: eq(propertiesTable.id, propertyId),
      columns: {
        id: true
      }
    })

    if (!property) {
      return {
        isSuccess: false,
        message: "Property not found"
      }
    }

    const formattedEndDate = new Date(formatDateToISODate(endDate))
    const formattedStartDate = new Date(formatDateToISODate(startDate))

    const blocks = await db.query.availabilityBlocks.findMany({
      where: and(
        eq(availabilityBlocksTable.propertyId, propertyId),
        lte(availabilityBlocksTable.startDate, formattedEndDate),
        gte(availabilityBlocksTable.endDate, formattedStartDate)
      ),
      columns: {
        id: true,
        startDate: true,
        endDate: true,
        source: true,
        reason: true
      }
    })

    return {
      isSuccess: true,
      message: "Availability blocks retrieved successfully",
      data: blocks
    }
  } catch (error) {
    console.error("Error getting availability blocks:", error)
    return {
      isSuccess: false,
      message: "Failed to get availability blocks"
    }
  }
} 