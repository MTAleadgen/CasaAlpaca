"use server"

import { db } from "@/db/db"
import { sendTemplatedMessageAction } from "@/actions/messaging-actions"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { format } from "date-fns"
import { ActionState } from "@/types"

/**
 * Send a booking confirmation message to a guest
 */
export async function sendBookingConfirmationAction(
  userId: string,
  bookingData: {
    guestFirstName: string
    guestPhoneNumber: string
    listingName: string
    checkInDate: Date
    checkOutDate: Date
    numberOfGuests: number
  }
): Promise<ActionState<void>> {
  try {
    // Find the booking confirmation template for the host
    const bookingTemplate = await db.query.messageTemplates.findFirst({
      where: (templates, { and, eq }) => 
        and(
          eq(templates.userId, userId),
          eq(templates.type, "booking_confirmation")
        )
    })

    if (!bookingTemplate) {
      return {
        isSuccess: false,
        message: "Booking confirmation template not found",
        data: undefined
      }
    }

    // Calculate number of nights
    const checkIn = new Date(bookingData.checkInDate)
    const checkOut = new Date(bookingData.checkOutDate)
    const numberOfNights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Format the check-in date
    const formattedCheckInDate = format(checkIn, "MMMM d, yyyy")

    // Send the templated message
    const result = await sendTemplatedMessageAction({
      userId: bookingData.guestPhoneNumber,
      phoneNumber: bookingData.guestPhoneNumber,
      templateId: bookingTemplate.id,
      variables: {
        guestFirstName: bookingData.guestFirstName,
        listingName: bookingData.listingName,
        checkInDate: formattedCheckInDate,
        numberOfNights: numberOfNights.toString(),
        numberOfGuests: bookingData.numberOfGuests.toString()
      }
    })

    if (!result.isSuccess) {
      return {
        isSuccess: false,
        message: `Failed to send booking confirmation: ${result.message}`,
        data: undefined
      }
    }

    return {
      isSuccess: true,
      message: "Booking confirmation sent successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error sending booking confirmation:", error)
    return {
      isSuccess: false,
      message: `Error sending booking confirmation: ${error instanceof Error ? error.message : String(error)}`,
      data: undefined
    }
  }
}

/**
 * Send check-in instructions to a guest
 * This is typically sent 3 days before check-in
 */
export async function sendCheckInInstructionsAction(
  userId: string,
  bookingData: {
    guestFirstName: string
    guestPhoneNumber: string
    listingName: string
    checkInDate: Date
    address: string
    wifiName?: string
    wifiPassword?: string
    houseManual?: string
    houseRules?: string
  }
): Promise<ActionState<void>> {
  try {
    // Find the check-in instructions template for the host
    const checkInTemplate = await db.query.messageTemplates.findFirst({
      where: (templates, { and, eq }) => 
        and(
          eq(templates.userId, userId),
          eq(templates.type, "check_in_instructions")
        )
    })

    if (!checkInTemplate) {
      return {
        isSuccess: false,
        message: "Check-in instructions template not found",
        data: undefined
      }
    }

    // Format the check-in date
    const formattedCheckInDate = format(new Date(bookingData.checkInDate), "MMMM d, yyyy")

    // Send the templated message
    const result = await sendTemplatedMessageAction({
      userId: bookingData.guestPhoneNumber,
      phoneNumber: bookingData.guestPhoneNumber,
      templateId: checkInTemplate.id,
      variables: {
        guestFirstName: bookingData.guestFirstName,
        listingName: bookingData.listingName,
        checkInDate: formattedCheckInDate,
        address: bookingData.address,
        wifiName: bookingData.wifiName || "Casa Alpaca WiFi",
        wifiPassword: bookingData.wifiPassword || "Your password will be provided upon arrival",
        houseManual: bookingData.houseManual || "A printed house manual is available at the property.",
        houseRules: bookingData.houseRules || "No smoking, no pets, quiet hours from 10pm to 8am."
      }
    })

    if (!result.isSuccess) {
      return {
        isSuccess: false,
        message: `Failed to send check-in instructions: ${result.message}`,
        data: undefined
      }
    }

    return {
      isSuccess: true,
      message: "Check-in instructions sent successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error sending check-in instructions:", error)
    return {
      isSuccess: false,
      message: `Error sending check-in instructions: ${error instanceof Error ? error.message : String(error)}`,
      data: undefined
    }
  }
} 