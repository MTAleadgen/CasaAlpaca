import { sendSmsAction } from "@/actions/twilio-actions"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

/**
 * POST handler for sending SMS messages
 * This can be used as a programmable endpoint for other systems to trigger SMS messages
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth()
    if (!userId || userId !== ADMIN_USER_ID) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { to, message } = body

    if (!to || !message) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Send SMS
    const result = await sendSmsAction(to, message, userId)

    if (result.isSuccess) {
      return NextResponse.json({
        success: true,
        messageId: result.data?.messageId
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error sending SMS:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
