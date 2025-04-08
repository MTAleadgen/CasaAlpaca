import {
  createExtraAction,
  deleteExtraAction,
  getExtrasAction,
  toggleExtraStatusAction,
  updateExtraAction
} from "@/actions/db/extras-actions"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET handler for retrieving all extras (admin only)
 *
 * This endpoint is protected by the middleware which
 * checks the admin status based on ADMIN_USER_ID
 */
export async function GET() {
  const result = await getExtrasAction(true)

  if (!result.isSuccess) {
    return NextResponse.json(
      { error: result.message },
      { status: result.message === "Unauthorized access" ? 403 : 400 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST handler for creating a new extra (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await createExtraAction(data)

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message === "Unauthorized access" ? 403 : 400 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

/**
 * PUT handler for updating an extra (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: "Extra ID is required" },
        { status: 400 }
      )
    }

    const result = await updateExtraAction(id, updateData)

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
 * DELETE handler for deleting an extra (admin only)
 */
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Extra ID is required" }, { status: 400 })
  }

  const result = await deleteExtraAction(id)

  if (!result.isSuccess) {
    return NextResponse.json(
      { error: result.message },
      { status: result.message === "Unauthorized access" ? 403 : 400 }
    )
  }

  return NextResponse.json({ success: true })
}
