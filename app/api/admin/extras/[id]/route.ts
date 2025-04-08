import {
  deleteExtraAction,
  getExtraByIdAction,
  updateExtraAction
} from "@/actions/db/extras-actions"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET handler for retrieving a specific extra by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await getExtraByIdAction(params.id, true)

  if (!result.isSuccess) {
    return NextResponse.json(
      { error: result.message },
      { status: result.message === "Unauthorized access" ? 403 : 404 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * PATCH handler for updating a specific extra by ID (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const result = await updateExtraAction(params.id, data)

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message === "Unauthorized access" ? 403 : 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

/**
 * DELETE handler for deleting a specific extra by ID (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await deleteExtraAction(params.id)

  if (!result.isSuccess) {
    return NextResponse.json(
      { error: result.message },
      { status: result.message === "Unauthorized access" ? 403 : 400 }
    )
  }

  return NextResponse.json({ success: true })
}
