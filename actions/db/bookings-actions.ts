"use server"

import { db } from "@/db/db"
import {
  availabilityBlocksTable,
  bookingExtrasTable,
  bookingsTable,
  bookingStatusEnum,
  extrasTable,
  InsertBooking,
  InsertBookingExtra,
  SelectBooking
} from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq, gt, inArray, lt, not, or, gte, lte, SQL } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { calculatePriceAction } from "./pricing-actions"
import { dateRangesOverlap, formatDateToISODate } from "@/lib/utils"
import { getFirstPropertyId } from "./availability-actions"

/**
 * Create a new booking request
 * 
 * @param data Booking data
 * @param extraIds Optional array of extra IDs
 * @returns ActionState with created booking
 */
export async function createBookingAction(
  data: InsertBooking,
  extraIds: string[] = []
): Promise<ActionState<SelectBooking>> {
  try {
    // Verify that the dates are available
    const availabilityCheck = await checkAvailability(
      data.propertyId,
      new Date(data.checkInDate),
      new Date(data.checkOutDate)
    )
    
    if (!availabilityCheck.isAvailable) {
      return {
        isSuccess: false,
        message: availabilityCheck.message || "Selected dates are not available"
      }
    }
    
    // Calculate price
    const priceResult = await calculatePriceAction(
      data.propertyId,
      new Date(data.checkInDate),
      new Date(data.checkOutDate),
      data.numGuests,
      extraIds
    )
    
    if (!priceResult.isSuccess) {
      return {
        isSuccess: false,
        message: priceResult.message
      }
    }
    
    const price = priceResult.data
    
    // Create the booking with PENDING status
    const [newBooking] = await db
      .insert(bookingsTable)
      .values({
        propertyId: data.propertyId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        numGuests: data.numGuests,
        totalAmount: price.total,
        priceBreakdown: price,
        status: data.status || "pending",
        bookingSource: data.bookingSource || "direct",
        notes: data.notes
      })
      .returning()
    
    // Add booking extras if any
    if (extraIds.length > 0 && newBooking) {
      // Get the extras to get their prices
      const extras = await db.query.extras.findMany({
        where: inArray(extrasTable.id, extraIds)
      })
      
      // Create booking extras with prices
      const bookingExtras: InsertBookingExtra[] = extraIds.map(extraId => {
        const extra = extras.find(e => e.id === extraId)
        return {
          bookingId: newBooking.id,
          extraId,
          quantity: 1, // Default to 1, could be customized
          price: extra?.price || 0 // Use the price from the extra
        }
      })
      
      await db
        .insert(bookingExtrasTable)
        .values(bookingExtras)
    }
    
    // Create an availability block for this booking to prevent double bookings
    // This ensures that the dates are blocked even before payment
    await db.insert(availabilityBlocksTable).values({
      propertyId: data.propertyId,
      startDate: new Date(data.checkInDate),
      endDate: new Date(data.checkOutDate),
      reason: `Booking #${newBooking.id.substring(0, 8)}`,
      source: "direct_booking"
    })
    
    return {
      isSuccess: true,
      message: "Booking created successfully",
      data: newBooking
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      isSuccess: false,
      message: "Failed to create booking"
    }
  }
}

/**
 * Get a booking by ID
 * 
 * @param bookingId Booking ID
 * @returns ActionState with booking data
 */
export async function getBookingAction(
  bookingId: string
): Promise<ActionState<SelectBooking | null>> {
  try {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookingsTable.id, bookingId),
      with: {
        extras: {
          with: {
            extra: true
          }
        }
      }
    })
    
    if (!booking) {
      return {
        isSuccess: false,
        message: "Booking not found"
      }
    }
    
    return {
      isSuccess: true,
      message: "Booking retrieved successfully",
      data: booking
    }
  } catch (error) {
    console.error("Error getting booking:", error)
    return {
      isSuccess: false,
      message: "Failed to get booking"
    }
  }
}

/**
 * Update a booking's status
 * This is typically used for admin operations or webhook handlers
 * 
 * @param bookingId Booking ID
 * @param status New booking status
 * @returns ActionState with updated booking
 */
export async function updateBookingStatusAction(
  bookingId: string,
  status: typeof bookingStatusEnum.enumValues[number]
): Promise<ActionState<SelectBooking>> {
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
    
    // Update the booking status
    const [updatedBooking] = await db
      .update(bookingsTable)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(bookingsTable.id, bookingId))
      .returning()
    
    if (!updatedBooking) {
      return {
        isSuccess: false,
        message: "Booking not found"
      }
    }
    
    return {
      isSuccess: true,
      message: "Booking status updated successfully",
      data: updatedBooking
    }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return {
      isSuccess: false,
      message: "Failed to update booking status"
    }
  }
}

/**
 * Cancel a booking
 * This can be used by users or admins
 * 
 * @param bookingId Booking ID
 * @returns ActionState with updated booking
 */
export async function cancelBookingAction(
  bookingId: string
): Promise<ActionState<SelectBooking>> {
  try {
    // User must be authenticated for this action
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // Get the booking to check if the user is authorized
    const booking = await db.query.bookings.findFirst({
      where: eq(bookingsTable.id, bookingId)
    })
    
    if (!booking) {
      return {
        isSuccess: false,
        message: "Booking not found"
      }
    }
    
    // Update the booking status to cancelled
    const [updatedBooking] = await db
      .update(bookingsTable)
      .set({
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(eq(bookingsTable.id, bookingId))
      .returning()
    
    // Remove the availability block for this booking
    // Note: Since we don't have bookingId in the schema, we need to identify by other means
    // This assumes the block has the same date range and property as the booking
    const checkInDate = new Date(formatDateToISODate(booking.checkInDate))
    const checkOutDate = new Date(formatDateToISODate(booking.checkOutDate))
    
    await db
      .delete(availabilityBlocksTable)
      .where(and(
        eq(availabilityBlocksTable.propertyId, booking.propertyId),
        eq(availabilityBlocksTable.startDate, checkInDate),
        eq(availabilityBlocksTable.endDate, checkOutDate),
        eq(availabilityBlocksTable.source, "direct_booking")
      ))
    
    return {
      isSuccess: true,
      message: "Booking cancelled successfully",
      data: updatedBooking
    }
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return {
      isSuccess: false,
      message: "Failed to cancel booking"
    }
  }
}

/**
 * Get bookings for a user by email
 * 
 * @param guestEmail Guest email to find bookings for (required)
 * @returns ActionState with user bookings
 */
export async function getUserBookingsAction(
  guestEmail: string
): Promise<ActionState<SelectBooking[]>> {
  try {
    // User must be authenticated for this action
    const { userId: authenticatedUserId } = await auth()
    
    if (!authenticatedUserId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    if (!guestEmail) {
      return {
        isSuccess: false,
        message: "Email is required to find bookings"
      }
    }
    
    const bookings = await db.query.bookings.findMany({
      where: eq(bookingsTable.guestEmail, guestEmail),
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
      with: {
        extras: {
          with: {
            extra: true
          }
        }
      }
    })
    
    return {
      isSuccess: true,
      message: "User bookings retrieved successfully",
      data: bookings
    }
  } catch (error) {
    console.error("Error getting user bookings:", error)
    return {
      isSuccess: false,
      message: "Failed to get user bookings"
    }
  }
}

/**
 * Get all bookings (ADMIN ONLY)
 * 
 * @param propertyId Optional property ID to filter by
 * @param startDate Optional start date to filter by
 * @param endDate Optional end date to filter by
 * @param status Optional status to filter by
 * @returns ActionState with bookings
 */
export async function getAllBookingsAction(
  propertyId?: string,
  startDate?: Date,
  endDate?: Date,
  status?: typeof bookingStatusEnum.enumValues[number]
): Promise<ActionState<SelectBooking[]>> {
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
    
    // Build query conditions
    const conditions: SQL[] = []
    
    if (propertyId) {
      conditions.push(eq(bookingsTable.propertyId, propertyId))
    }
    
    if (startDate) {
      const formattedStartDate = new Date(formatDateToISODate(startDate))
      conditions.push(gte(bookingsTable.checkInDate, formattedStartDate))
    }
    
    if (endDate) {
      const formattedEndDate = new Date(formatDateToISODate(endDate))
      conditions.push(lte(bookingsTable.checkOutDate, formattedEndDate))
    }
    
    if (status) {
      conditions.push(eq(bookingsTable.status, status))
    }
    
    // Combine conditions with AND
    const whereClause = conditions.length > 0 
      ? and(...conditions) 
      : undefined
    
    const bookings = await db.query.bookings.findMany({
      where: whereClause,
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
      with: {
        extras: {
          with: {
            extra: true
          }
        }
      }
    })
    
    return {
      isSuccess: true,
      message: "Bookings retrieved successfully",
      data: bookings
    }
  } catch (error) {
    console.error("Error getting bookings:", error)
    return {
      isSuccess: false,
      message: "Failed to get bookings"
    }
  }
}

/**
 * Check if dates are available for a property
 */
async function checkAvailability(
  propertyId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<{ isAvailable: boolean; message?: string }> {
  try {
    if (!propertyId) {
      const firstPropertyId = await getFirstPropertyId()
      
      if (!firstPropertyId) {
        return {
          isAvailable: false,
          message: "No property found"
        }
      }
      
      propertyId = firstPropertyId
    }
    
    // Check for overlapping bookings (that aren't cancelled)
    const overlappingBookings = await db.query.bookings.findMany({
      where: and(
        eq(bookingsTable.propertyId, propertyId),
        not(eq(bookingsTable.status, "cancelled")),
        or(
          // Start date falls within a booking
          and(
            lte(bookingsTable.checkInDate, checkInDate),
            gte(bookingsTable.checkOutDate, checkInDate)
          ),
          // End date falls within a booking
          and(
            lte(bookingsTable.checkInDate, checkOutDate),
            gte(bookingsTable.checkOutDate, checkOutDate)
          ),
          // New range completely contains a booking
          and(
            gte(bookingsTable.checkInDate, checkInDate),
            lte(bookingsTable.checkOutDate, checkOutDate)
          )
        )
      )
    })
    
    if (overlappingBookings.length > 0) {
      return {
        isAvailable: false,
        message: "Dates overlap with existing bookings"
      }
    }
    
    // Check for availability blocks
    const overlappingBlocks = await db.query.availabilityBlocks.findMany({
      where: and(
        eq(availabilityBlocksTable.propertyId, propertyId),
        or(
          // Start date falls within a block
          and(
            lte(availabilityBlocksTable.startDate, checkInDate),
            gte(availabilityBlocksTable.endDate, checkInDate)
          ),
          // End date falls within a block
          and(
            lte(availabilityBlocksTable.startDate, checkOutDate),
            gte(availabilityBlocksTable.endDate, checkOutDate)
          ),
          // New range completely contains a block
          and(
            gte(availabilityBlocksTable.startDate, checkInDate),
            lte(availabilityBlocksTable.endDate, checkOutDate)
          )
        )
      )
    })
    
    if (overlappingBlocks.length > 0) {
      return {
        isAvailable: false,
        message: "Dates are not available due to availability blocks"
      }
    }
    
    return {
      isAvailable: true
    }
  } catch (error) {
    console.error("Error checking availability:", error)
    return {
      isAvailable: false,
      message: "Failed to check availability"
    }
  }
}

/**
 * Get upcoming bookings for a property
 * Used for the calendar and availability displays
 * 
 * @param propertyId The property ID
 * @param startDate Start date for the range
 * @param endDate End date for the range
 * @returns ActionState with upcoming bookings
 */
export async function getUpcomingBookingsAction(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionState<SelectBooking[]>> {
  try {
    if (!propertyId) {
      // If no property ID is provided, get the first property (assuming single property site)
      const firstPropertyId = await getFirstPropertyId()
      
      if (!firstPropertyId) {
        return {
          isSuccess: false,
          message: "No property found"
        }
      }
      
      propertyId = firstPropertyId
    }
    
    // Format dates for query
    const formattedStartDate = new Date(formatDateToISODate(startDate))
    const formattedEndDate = new Date(formatDateToISODate(endDate))
    
    const bookings = await db.query.bookings.findMany({
      where: and(
        eq(bookingsTable.propertyId, propertyId),
        not(eq(bookingsTable.status, "cancelled")),
        or(
          // Check-in date falls within the requested range
          and(
            gte(bookingsTable.checkInDate, formattedStartDate),
            lte(bookingsTable.checkInDate, formattedEndDate)
          ),
          // Check-out date falls within the requested range
          and(
            gte(bookingsTable.checkOutDate, formattedStartDate),
            lte(bookingsTable.checkOutDate, formattedEndDate)
          ),
          // Booking completely contains the requested range
          and(
            lte(bookingsTable.checkInDate, formattedStartDate),
            gte(bookingsTable.checkOutDate, formattedEndDate)
          )
        )
      ),
      orderBy: (bookings, { asc }) => [asc(bookings.checkInDate)]
    })
    
    return {
      isSuccess: true,
      message: "Upcoming bookings retrieved successfully",
      data: bookings
    }
  } catch (error) {
    console.error("Error getting upcoming bookings:", error)
    return {
      isSuccess: false,
      message: "Failed to get upcoming bookings"
    }
  }
} 