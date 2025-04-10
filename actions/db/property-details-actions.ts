"use server"

import { db } from "@/db/db"
import { InsertPropertyDetail, SelectPropertyDetail, propertyDetailsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq } from "drizzle-orm"

export async function createPropertyDetailAction(
  detail: InsertPropertyDetail
): Promise<ActionState<SelectPropertyDetail>> {
  try {
    // Check if a record already exists for this property
    const existing = await db.query.propertyDetails.findFirst({
      where: and(
        eq(propertyDetailsTable.userId, detail.userId),
        eq(propertyDetailsTable.propertyId, detail.propertyId)
      )
    })

    if (existing) {
      // If it exists, update it instead
      return updatePropertyDetailAction(existing.id, detail)
    }

    const [newDetail] = await db
      .insert(propertyDetailsTable)
      .values(detail)
      .returning()
    
    return {
      isSuccess: true,
      message: "Property details created successfully",
      data: newDetail
    }
  } catch (error) {
    console.error("Error creating property details:", error)
    return { isSuccess: false, message: "Failed to create property details" }
  }
}

export async function getPropertyDetailAction(
  userId: string,
  propertyId: string
): Promise<ActionState<SelectPropertyDetail>> {
  try {
    const detail = await db.query.propertyDetails.findFirst({
      where: and(
        eq(propertyDetailsTable.userId, userId),
        eq(propertyDetailsTable.propertyId, propertyId)
      )
    })
    
    if (!detail) {
      return { isSuccess: false, message: "Property details not found" }
    }
    
    return {
      isSuccess: true,
      message: "Property details retrieved successfully",
      data: detail
    }
  } catch (error) {
    console.error("Error getting property details:", error)
    return { isSuccess: false, message: "Failed to get property details" }
  }
}

export async function getAllPropertyDetailsAction(
  userId: string
): Promise<ActionState<SelectPropertyDetail[]>> {
  try {
    const details = await db.query.propertyDetails.findMany({
      where: eq(propertyDetailsTable.userId, userId)
    })
    
    return {
      isSuccess: true,
      message: "Property details retrieved successfully",
      data: details
    }
  } catch (error) {
    console.error("Error getting all property details:", error)
    return { isSuccess: false, message: "Failed to get property details" }
  }
}

export async function updatePropertyDetailAction(
  id: string,
  data: Partial<InsertPropertyDetail>
): Promise<ActionState<SelectPropertyDetail>> {
  try {
    const [updatedDetail] = await db
      .update(propertyDetailsTable)
      .set(data)
      .where(eq(propertyDetailsTable.id, id))
      .returning()
    
    if (!updatedDetail) {
      return { isSuccess: false, message: "Property details not found" }
    }
    
    return {
      isSuccess: true,
      message: "Property details updated successfully",
      data: updatedDetail
    }
  } catch (error) {
    console.error("Error updating property details:", error)
    return { isSuccess: false, message: "Failed to update property details" }
  }
}

export async function deletePropertyDetailAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(propertyDetailsTable).where(eq(propertyDetailsTable.id, id))
    
    return {
      isSuccess: true,
      message: "Property details deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting property details:", error)
    return { isSuccess: false, message: "Failed to delete property details" }
  }
} 