"use server"

import { createMessageAction, updateMessageAction } from "@/actions/db/messages-actions"
import { auth } from "@clerk/nextjs/server"
import { ActionState } from "@/types"
import twilio from "twilio"

// Environment variables for Twilio SMS
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

// Initialize Twilio client
const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null

/**
 * Send an SMS message via Twilio to a specified phone number
 */
export async function sendSmsAction(
  phoneNumber: string,
  message: string,
  userId?: string
): Promise<ActionState<{ messageId: string }>> {
  try {
    // Check if Twilio is configured
    if (!twilioClient || !TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio is not configured")
    }

    // Get the authenticated user or use provided userId
    const session = await auth()
    const currentUserId = userId || session?.userId

    if (!currentUserId) {
      return {
        isSuccess: false,
        message: "User not authenticated"
      }
    }

    // Format phone number (remove any non-numeric characters and ensure it has country code)
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, "")
    
    // If the phone number doesn't start with +, add +1 (US code) as default
    const finalPhoneNumber = formattedPhoneNumber.startsWith("+") 
      ? formattedPhoneNumber 
      : `+1${formattedPhoneNumber}`

    // Send the message through Twilio SMS API
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: finalPhoneNumber
    })

    // Save the message to the database
    const messageResult = await createMessageAction({
      userId: currentUserId,
      adminId: currentUserId === ADMIN_USER_ID ? currentUserId : undefined,
      phoneNumber: finalPhoneNumber,
      content: message,
      direction: "outbound",
      messageId: twilioMessage.sid
    })

    if (!messageResult.isSuccess) {
      throw new Error("Failed to save message to database")
    }

    return {
      isSuccess: true,
      message: "SMS sent successfully",
      data: { messageId: twilioMessage.sid }
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
 * Handle incoming Twilio SMS webhook events
 * This function will be called by an API route
 */
export async function handleTwilioWebhookAction(
  payload: any
): Promise<ActionState<void>> {
  try {
    // Extract message data from webhook payload
    const messageSid = payload.MessageSid
    const from = payload.From
    const body = payload.Body

    if (!messageSid || !from) {
      return {
        isSuccess: false,
        message: "Invalid webhook payload",
        data: undefined
      }
    }

    // Save incoming message to the database
    await createMessageAction({
      userId: ADMIN_USER_ID || "", // Messages go to admin
      phoneNumber: from,
      content: body || "[Empty message]",
      direction: "inbound",
      status: "received",
      messageId: messageSid
    })

    return {
      isSuccess: true,
      message: "Webhook processed successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error processing Twilio webhook:", error)
    return {
      isSuccess: false,
      message: "Failed to process webhook",
      data: undefined
    }
  }
}

/**
 * Update message status based on Twilio status webhook
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

    // Find message by Twilio message ID and update status
    await updateMessageAction(messageId, { status: mappedStatus })

    return {
      isSuccess: true,
      message: "Message status updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating message status:", error)
    return {
      isSuccess: false,
      message: "Failed to update message status",
      data: undefined
    }
  }
} 