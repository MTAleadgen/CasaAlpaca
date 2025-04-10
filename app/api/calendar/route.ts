"use server"

import { db } from "@/db/db"
import { bookingsTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // You may want to add auth/token validation here

  try {
    // Query bookings from your database
    const bookings = await db.query.bookings.findMany()

    // Generate iCalendar content
    let iCalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Casa Alpaca//Booking System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Casa Alpaca Bookings
X-WR-TIMEZONE:America/Detroit
`

    // Add each booking as an event
    for (const booking of bookings) {
      const startDate = new Date(booking.checkInDate)
      const endDate = new Date(booking.checkOutDate)

      // Format dates to iCal format (YYYYMMDD)
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split("T")[0]
      }

      const uid = booking.id
      const summary = `Booked: ${booking.guestName || "Reserved"}`

      iCalContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}
DTSTART;VALUE=DATE:${formatDate(startDate)}
DTEND;VALUE=DATE:${formatDate(endDate)}
SUMMARY:${summary}
DESCRIPTION:Booking from Casa Alpaca website
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
`
    }

    // Close the calendar
    iCalContent += "END:VCALENDAR"

    // Return the iCal content
    return new NextResponse(iCalContent, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": 'attachment; filename="casa-alpaca-calendar.ics"'
      }
    })
  } catch (error) {
    console.error("Error generating iCal feed:", error)
    return NextResponse.json(
      { error: "Failed to generate calendar feed" },
      { status: 500 }
    )
  }
}
