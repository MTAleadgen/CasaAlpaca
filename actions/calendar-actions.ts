"use server"

import { ActionState } from "@/types"
import ical from "node-ical"

interface BookedDate {
  id: string
  start: Date
  end: Date
  summary: string
  source: "vrbo" | "airbnb"
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