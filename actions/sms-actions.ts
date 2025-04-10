"use server"

import { createMessageAction, updateMessageAction } from "@/actions/db/messages-actions"
import { auth } from "@clerk/nextjs/server"
import { ActionState } from "@/types"

// Environment variables for Twilio API
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

/**
 * Send an SMS message to a specified phone number
 */
export async function sendSmsAction(
  phoneNumber: string,
  message: string,
  userId?: string
): Promise<ActionState<{ messageId: string }>> {
  try {
    // Get the authenticated user or use provided userId
    const session = await auth()
    const currentUserId = userId || session?.userId

    if (!currentUserId) {
      return {
        isSuccess: false,
        message: "User not authenticated"
      }
    }

    // Check if Twilio credentials are configured
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return {
        isSuccess: false,
        message: "Twilio is not configured. Please set the required environment variables."
      }
    }

    // Format phone number (remove any non-numeric characters and ensure it has country code)
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, "")

    // Create a unique message ID
    const smsMessageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // For testing without actually sending SMS, uncomment this block
    /*
    // Save the message to the database without actually sending
    const messageResult = await createMessageAction({
      userId: currentUserId,
      adminId: currentUserId === ADMIN_USER_ID ? currentUserId : undefined,
      phoneNumber: formattedPhoneNumber,
      content: message,
      direction: "outbound",
      messageId: smsMessageId
    })

    return {
      isSuccess: true,
      message: "Message saved (SMS sending disabled for testing)",
      data: { messageId: smsMessageId }
    }
    */

    // In production, uncomment this block to send SMS via Twilio
    const twilioClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    const response = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhoneNumber
    })

    // Save the message to the database
    const messageResult = await createMessageAction({
      userId: currentUserId,
      adminId: currentUserId === ADMIN_USER_ID ? currentUserId : undefined,
      phoneNumber: formattedPhoneNumber,
      content: message,
      direction: "outbound",
      messageId: response.sid
    })

    if (!messageResult.isSuccess) {
      throw new Error("Failed to save message to database")
    }

    return {
      isSuccess: true,
      message: "SMS sent successfully",
      data: { messageId: response.sid }
    }
  } catch (error) {
    console.error("Error sending SMS:", error)
    return {
      isSuccess: false,
      message: `Failed to send SMS: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

/**
 * Update SMS message status based on Twilio webhook
 */
export async function updateSmsStatusAction(
  messageId: string,
  status: string
): Promise<ActionState<void>> {
  try {
    // Map Twilio statuses to our system statuses
    const statusMap: Record<string, string> = {
      sent: "sent",
      delivered: "delivered",
      read: "read",
      failed: "failed",
      undelivered: "failed"
    }

    const mappedStatus = statusMap[status] || status

    // Find message by SMS message ID and update status
    await updateMessageAction(messageId, { status: mappedStatus })

    return {
      isSuccess: true,
      message: "SMS status updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating SMS status:", error)
    return {
      isSuccess: false,
      message: "Failed to update SMS status",
      data: undefined
    }
  }
} 