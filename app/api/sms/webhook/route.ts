import { createMessageAction } from "@/actions/db/messages-actions"
import { updateSmsStatusAction } from "@/actions/sms-actions"
import { NextRequest, NextResponse } from "next/server"

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

/**
 * Handle incoming SMS messages from Twilio webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data from Twilio webhook
    const formData = await request.formData()

    // Extract message details
    const messageId = formData.get("MessageSid")?.toString() || ""
    const from = formData.get("From")?.toString() || ""
    const body = formData.get("Body")?.toString() || ""
    const status = formData.get("MessageStatus")?.toString() || ""

    // Handle status update
    if (status && messageId) {
      await updateSmsStatusAction(messageId, status)
      return new NextResponse("Status updated", { status: 200 })
    }

    // Handle incoming message
    if (body && from) {
      // Save incoming message to the database
      await createMessageAction({
        userId: ADMIN_USER_ID || "",
        phoneNumber: from,
        content: body,
        direction: "inbound",
        status: "received",
        messageId
      })

      return new NextResponse("Message received", { status: 200 })
    }

    return new NextResponse("No action taken", { status: 200 })
  } catch (error) {
    console.error("Error processing SMS webhook:", error)
    return new NextResponse("Error processing webhook", { status: 500 })
  }
}
