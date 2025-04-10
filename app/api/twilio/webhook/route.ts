import {
  handleTwilioWebhookAction,
  updateSmsStatusAction
} from "@/actions/twilio-actions"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST handler for incoming Twilio webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Twilio webhooks use form data, not JSON
    const formData = await request.formData()

    // Convert form data to an object
    const payload: Record<string, any> = {}
    formData.forEach((value, key) => {
      payload[key] = value
    })

    // Process the webhook based on its type
    if (payload.MessageSid) {
      // This is an incoming message webhook
      await handleTwilioWebhookAction(payload)
      return new NextResponse("OK", { status: 200 })
    } else if (payload.MessageStatus && payload.MessageSid) {
      // This is a status update webhook
      await updateSmsStatusAction(payload.MessageSid, payload.MessageStatus)
      return new NextResponse("OK", { status: 200 })
    }

    return new NextResponse("Not Found", { status: 404 })
  } catch (error) {
    console.error("Error processing Twilio webhook:", error)
    return new NextResponse("Server Error", { status: 500 })
  }
}
