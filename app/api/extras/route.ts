import { getExtrasAction } from "@/actions/db/extras-actions"
import { NextResponse } from "next/server"

/**
 * GET handler for retrieving all active extras
 *
 * This endpoint is public and returns only active extras
 * for use in the booking process.
 */
export async function GET() {
  const result = await getExtrasAction(false)

  if (!result.isSuccess) {
    return NextResponse.json({ error: result.message }, { status: 400 })
  }

  return NextResponse.json(result.data)
}
