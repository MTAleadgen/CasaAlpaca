"use server"

import { createMessageAction, updateMessageAction } from "@/actions/db/messages-actions"
import { auth } from "@clerk/nextjs/server"
import { ActionState } from "@/types"

// Environment variables for WhatsApp API
const WHATSAPP_API_URL = "https://graph.facebook.com/v19.0"
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

/**
 * Send a WhatsApp message to a specified phone number
 */
export async function sendWhatsAppMessageAction(
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

    // Format phone number (remove any non-numeric characters and ensure it has country code)
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, "")

    // Set up WhatsApp API payload
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhoneNumber,
      type: "text",
      text: {
        body: message
      }
    }

    // Send the message through WhatsApp API
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const whatsappMessageId = data.messages[0].id

    // Save the message to the database
    const messageResult = await createMessageAction({
      userId: currentUserId,
      adminId: currentUserId === ADMIN_USER_ID ? currentUserId : undefined,
      phoneNumber: formattedPhoneNumber,
      content: message,
      direction: "outbound",
      messageId: whatsappMessageId
    })

    if (!messageResult.isSuccess) {
      throw new Error("Failed to save message to database")
    }

    return {
      isSuccess: true,
      message: "Message sent successfully",
      data: { messageId: whatsappMessageId }
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return {
      isSuccess: false,
      message: `Failed to send WhatsApp message: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

/**
 * Handle incoming WhatsApp webhook events
 * This function will be called by an API route
 */
export async function handleWhatsAppWebhookAction(
  payload: any
): Promise<ActionState<void>> {
  try {
    // Extract message data from webhook payload
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) {
      return {
        isSuccess: true,
        message: "No messages in webhook payload",
        data: undefined
      }
    }

    // Process each message in the webhook
    for (const message of messages) {
      const messageId = message.id
      const from = message.from
      const timestamp = message.timestamp
      
      let messageContent = ""
      
      // Extract message content based on type
      if (message.type === "text") {
        messageContent = message.text.body
      } else if (message.type === "image") {
        messageContent = "📷 [Image]"
      } else if (message.type === "audio") {
        messageContent = "🔊 [Audio]"
      } else if (message.type === "video") {
        messageContent = "🎥 [Video]"
      } else if (message.type === "document") {
        messageContent = "📄 [Document]"
      } else {
        messageContent = `[${message.type} message]`
      }

      // Save incoming message to the database
      await createMessageAction({
        userId: ADMIN_USER_ID || "", // Messages go to admin
        phoneNumber: from,
        content: messageContent,
        direction: "inbound",
        status: "received",
        messageId
      })
    }

    return {
      isSuccess: true,
      message: "Webhook processed successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error)
    return {
      isSuccess: false,
      message: "Failed to process webhook",
      data: undefined
    }
  }
}

/**
 * Update message status based on WhatsApp status webhook
 */
export async function updateMessageStatusAction(
  messageId: string,
  status: string
): Promise<ActionState<void>> {
  try {
    // Map WhatsApp statuses to our system statuses
    const statusMap: Record<string, string> = {
      sent: "sent",
      delivered: "delivered",
      read: "read",
      failed: "failed"
    }

    const mappedStatus = statusMap[status] || status

    // Find message by WhatsApp message ID and update status
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