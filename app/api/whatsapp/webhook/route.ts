import {
  handleWhatsAppWebhookAction,
  updateMessageStatusAction
} from "@/actions/whatsapp-actions"
import { NextRequest, NextResponse } from "next/server"

// WhatsApp Webhook Verification Token from environment variables
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

/**
 * GET handler for webhook verification
 * This is used when you set up the webhook in the WhatsApp Business Platform
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    // Check if a token and mode are in the query string of the request
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        console.log("WEBHOOK_VERIFIED")
        return new NextResponse(challenge, { status: 200 })
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        return new NextResponse("Forbidden", { status: 403 })
      }
    }

    return new NextResponse("Bad Request", { status: 400 })
  } catch (error) {
    console.error("Error verifying webhook:", error)
    return new NextResponse("Server Error", { status: 500 })
  }
}

/**
 * POST handler for incoming webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Process different types of webhook events
    if (payload.object === "whatsapp_business_account") {
      const entry = payload.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value

      // Handle message status updates
      if (value?.statuses) {
        for (const status of value.statuses) {
          await updateMessageStatusAction(status.id, status.status)
        }
      }

      // Handle incoming messages
      if (value?.messages) {
        await handleWhatsAppWebhookAction(payload)
      }

      return new NextResponse("OK", { status: 200 })
    }

    return new NextResponse("Not Found", { status: 404 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new NextResponse("Server Error", { status: 500 })
  }
}
