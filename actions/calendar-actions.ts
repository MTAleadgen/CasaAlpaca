"use server"

import { ActionState } from "@/types"
import ical from "node-ical"
import { db } from "@/db/db"
import { randomUUID } from "crypto"
import { calendarSourcesTable, calendarsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

interface BookedDate {
  id: string
  start: Date
  end: Date
  summary: string
  source: "vrbo" | "airbnb"
}

interface CalendarToken {
  token: string
}

interface CalendarSource {
  id: string
  userId: string
  url: string
  platform: string
  createdAt: Date
}

// Constants for calendar URLs
const VRBO_CALENDAR_URL = "http://www.vrbo.com/icalendar/07407781b20041f1b2962f6d06243216.ics?nonTentative"
const AIRBNB_CALENDAR_URL = "https://www.airbnb.com/calendar/ical/1317460106754094447.ics?s=78ba39c25491b8875a93837dce1c43a9"

/**
 * Fetches calendar data from a given iCal URL
 */
async function fetchCalendarData(url: string, source: "vrbo" | "airbnb"): Promise<BookedDate[]> {
  try {
    const response = await fetch(url, { cache: "no-store" })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar data from ${source}: ${response.status}`)
    }
    
    const icalData = await response.text()
    const parsedData = ical.parseICS(icalData)
    
    const bookedDates: BookedDate[] = []
    
    for (const key in parsedData) {
      const event = parsedData[key]
      
      if (event.type === "VEVENT") {
        bookedDates.push({
          id: event.uid,
          start: event.start,
          end: event.end,
          summary: event.summary || `Reserved (${source})`,
          source
        })
      }
    }
    
    return bookedDates
  } catch (error) {
    console.error(`Error fetching ${source} calendar:`, error)
    return []
  }
}

/**
 * Fetches and combines calendar data from both VRBO and Airbnb
 */
export async function getAvailabilityAction(): Promise<ActionState<BookedDate[]>> {
  try {
    const [vrboBookings, airbnbBookings] = await Promise.all([
      fetchCalendarData(VRBO_CALENDAR_URL, "vrbo"),
      fetchCalendarData(AIRBNB_CALENDAR_URL, "airbnb")
    ])
    
    const allBookings = [...vrboBookings, ...airbnbBookings]
    
    return {
      isSuccess: true,
      message: "Successfully fetched availability data",
      data: allBookings
    }
  } catch (error) {
    console.error("Error fetching availability:", error)
    return {
      isSuccess: false,
      message: "Failed to fetch availability data"
    }
  }
}

/**
 * Checks if a specific date range is available
 */
export async function checkAvailabilityAction(
  checkIn: Date, 
  checkOut: Date
): Promise<ActionState<{ isAvailable: boolean }>> {
  try {
    const { isSuccess, data } = await getAvailabilityAction()
    
    if (!isSuccess || !data) {
      throw new Error("Failed to fetch booking data")
    }
    
    // Normalize dates to midnight for comparison
    const normalizedCheckIn = new Date(checkIn)
    normalizedCheckIn.setHours(0, 0, 0, 0)
    
    const normalizedCheckOut = new Date(checkOut)
    normalizedCheckOut.setHours(0, 0, 0, 0)
    
    // Check if requested dates overlap with any existing booking
    const isAvailable = !data.some(booking => {
      const bookingStart = new Date(booking.start)
      bookingStart.setHours(0, 0, 0, 0)
      
      const bookingEnd = new Date(booking.end)
      bookingEnd.setHours(0, 0, 0, 0)
      
      // Check if there's any overlap
      return (
        (normalizedCheckIn >= bookingStart && normalizedCheckIn < bookingEnd) ||
        (normalizedCheckOut > bookingStart && normalizedCheckOut <= bookingEnd) ||
        (normalizedCheckIn <= bookingStart && normalizedCheckOut >= bookingEnd)
      )
    })
    
    return {
      isSuccess: true,
      message: isAvailable ? "Dates are available" : "Dates are not available",
      data: { isAvailable }
    }
  } catch (error) {
    console.error("Error checking availability:", error)
    return {
      isSuccess: false,
      message: "Failed to check availability"
    }
  }
}

// Generate a unique calendar token for the user
export async function generateCalendarTokenAction(): Promise<ActionState<CalendarToken>> {
  try {
    const userId = "user_123" // In a real app, this would come from auth.userId()
    const token = randomUUID()
    
    // Check if a calendar already exists for this user
    const existingCalendar = await db.query.calendars.findFirst({
      where: eq(calendarsTable.userId, userId)
    })
    
    if (existingCalendar) {
      // Update existing calendar token
      await db
        .update(calendarsTable)
        .set({ token })
        .where(eq(calendarsTable.userId, userId))
    } else {
      // Create new calendar token
      await db.insert(calendarsTable).values({
        userId,
        token
      })
    }
    
    return {
      isSuccess: true,
      message: "Calendar token generated successfully",
      data: { token }
    }
  } catch (error) {
    console.error("Error generating calendar token:", error)
    return {
      isSuccess: false,
      message: "Failed to generate calendar token"
    }
  }
}

// Get the calendar token for the current user
export async function getCalendarTokenAction(): Promise<ActionState<CalendarToken | null>> {
  try {
    const userId = "user_123" // In a real app, this would come from auth.userId()
    
    const calendar = await db.query.calendars.findFirst({
      where: eq(calendarsTable.userId, userId)
    })
    
    if (!calendar) {
      return {
        isSuccess: true,
        message: "No calendar token found",
        data: null
      }
    }
    
    return {
      isSuccess: true,
      message: "Calendar token retrieved successfully",
      data: { token: calendar.token }
    }
  } catch (error) {
    console.error("Error retrieving calendar token:", error)
    return {
      isSuccess: false,
      message: "Failed to retrieve calendar token"
    }
  }
}

// Add an external calendar source
export async function addCalendarSourceAction(
  url: string,
  platform: string
): Promise<ActionState<CalendarSource>> {
  try {
    const userId = "user_123" // In a real app, this would come from auth.userId()
    
    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      return {
        isSuccess: false,
        message: "Invalid URL format"
      }
    }
    
    // Check if this URL is already added
    const existingSource = await db.query.calendarSources.findFirst({
      where: eq(calendarSourcesTable.url, url)
    })
    
    if (existingSource) {
      return {
        isSuccess: false,
        message: "This calendar is already connected"
      }
    }
    
    // Insert new calendar source
    const [newSource] = await db
      .insert(calendarSourcesTable)
      .values({
        userId,
        url,
        platform
      })
      .returning()
    
    return {
      isSuccess: true,
      message: `${platform} calendar added successfully`,
      data: newSource
    }
  } catch (error) {
    console.error("Error adding calendar source:", error)
    return {
      isSuccess: false,
      message: "Failed to add calendar source"
    }
  }
}

// Remove an external calendar source
export async function removeCalendarSourceAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const userId = "user_123" // In a real app, this would come from auth.userId()
    
    // Delete the calendar source
    await db
      .delete(calendarSourcesTable)
      .where(eq(calendarSourcesTable.id, id))
    
    return {
      isSuccess: true,
      message: "Calendar removed successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error removing calendar source:", error)
    return {
      isSuccess: false,
      message: "Failed to remove calendar source"
    }
  }
}

// Get all external calendar sources for the current user
export async function getCalendarSourcesAction(): Promise<ActionState<CalendarSource[]>> {
  try {
    const userId = "user_123" // In a real app, this would come from auth.userId()
    
    const sources = await db.query.calendarSources.findMany({
      where: eq(calendarSourcesTable.userId, userId)
    })
    
    return {
      isSuccess: true,
      message: "Calendar sources retrieved successfully",
      data: sources
    }
  } catch (error) {
    console.error("Error retrieving calendar sources:", error)
    return {
      isSuccess: false,
      message: "Failed to retrieve calendar sources"
    }
  }
} 