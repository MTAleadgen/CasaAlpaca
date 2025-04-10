/**
 * @description
 * This file contains server actions for managing bookable extras
 * like early check-in and late check-out options.
 * 
 * @dependencies
 * - @/db/db: Database connection
 * - @/db/schema: Database schema types
 * - @/types: ActionState type for consistent response format
 */

"use server"

import { db } from "@/db/db"
import {
  InsertExtra,
  SelectExtra,
  extrasTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"

/**
 * Get all extras
 * 
 * Returns all active extras for display on the booking form
 * or all extras (active and inactive) for the admin.
 * 
 * @param adminMode If true, includes inactive extras (for admin use)
 * @returns Promise<ActionState<SelectExtra[]>> The extras or an error
 */
export async function getExtrasAction(
  adminMode = false
): Promise<ActionState<SelectExtra[]>> {
  try {
    let extras
    
    if (adminMode) {
      // Check if user is admin
      // Temporarily commented out for development
      // const { userId } = await auth()
      // const adminId = process.env.ADMIN_USER_ID

      // if (!userId || userId !== adminId) {
      //   return { 
      //     isSuccess: false, 
      //     message: "Unauthorized access" 
      //   }
      // }
      
      // Get all extras (including inactive) for admin
      extras = await db.query.extras.findMany()
    } else {
      // Get only active extras for public use
      extras = await db.query.extras.findMany({
        where: eq(extrasTable.isActive, true)
      })
    }
    
    return {
      isSuccess: true,
      message: "Extras retrieved successfully",
      data: extras
    }
  } catch (error) {
    console.error("Error getting extras:", error)
    return { isSuccess: false, message: "Failed to get extras" }
  }
}

/**
 * Create a new extra (admin only)
 * 
 * @param data The extra data to create
 * @returns Promise<ActionState<SelectExtra>> The created extra or an error
 */
export async function createExtraAction(
  data: InsertExtra
): Promise<ActionState<SelectExtra>> {
  try {
    // Check if user is admin
    // Temporarily commented out for development
    // const { userId } = await auth()
    // const adminId = process.env.ADMIN_USER_ID

    // if (!userId || userId !== adminId) {
    //   return { 
    //     isSuccess: false, 
    //     message: "Unauthorized access" 
    //   }
    // }
    
    // Validate required fields
    if (!data.name || !data.type || data.price === undefined) {
      return {
        isSuccess: false,
        message: "Missing required fields (name, type, price)"
      }
    }
    
    // Create the extra
    const [newExtra] = await db
      .insert(extrasTable)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()
    
    return {
      isSuccess: true,
      message: "Extra created successfully",
      data: newExtra
    }
  } catch (error) {
    console.error("Error creating extra:", error)
    return { isSuccess: false, message: "Failed to create extra" }
  }
}

/**
 * Get a single extra by ID
 * 
 * @param id The extra ID
 * @param adminMode If true, allows retrieving inactive extras (admin only)
 * @returns Promise<ActionState<SelectExtra>> The extra or an error
 */
export async function getExtraByIdAction(
  id: string,
  adminMode = false
): Promise<ActionState<SelectExtra>> {
  try {
    let extra
    
    if (adminMode) {
      // Check if user is admin
      // Temporarily commented out for development
      // const { userId } = await auth()
      // const adminId = process.env.ADMIN_USER_ID

      // if (!userId || userId !== adminId) {
      //   return { 
      //     isSuccess: false, 
      //     message: "Unauthorized access" 
      //   }
      // }
      
      // Get the extra (even if inactive) for admin
      extra = await db.query.extras.findFirst({
        where: eq(extrasTable.id, id)
      })
    } else {
      // Get the extra only if active for public use
      extra = await db.query.extras.findFirst({
        where: and(
          eq(extrasTable.id, id),
          eq(extrasTable.isActive, true)
        )
      })
    }
    
    if (!extra) {
      return { isSuccess: false, message: "Extra not found" }
    }
    
    return {
      isSuccess: true,
      message: "Extra retrieved successfully",
      data: extra
    }
  } catch (error) {
    console.error("Error getting extra:", error)
    return { isSuccess: false, message: "Failed to get extra" }
  }
}

/**
 * Update an extra (admin only)
 * 
 * @param id The extra ID to update
 * @param data The extra data to update
 * @returns Promise<ActionState<SelectExtra>> The updated extra or an error
 */
export async function updateExtraAction(
  id: string,
  data: Partial<InsertExtra>
): Promise<ActionState<SelectExtra>> {
  try {
    // Check if user is admin
    // Temporarily commented out for development
    // const { userId } = await auth()
    // const adminId = process.env.ADMIN_USER_ID

    // if (!userId || userId !== adminId) {
    //   return { 
    //     isSuccess: false, 
    //     message: "Unauthorized access" 
    //   }
    // }
    
    // Update the extra
    const [updatedExtra] = await db
      .update(extrasTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(extrasTable.id, id))
      .returning()
    
    if (!updatedExtra) {
      return { isSuccess: false, message: "Extra not found" }
    }
    
    return {
      isSuccess: true,
      message: "Extra updated successfully",
      data: updatedExtra
    }
  } catch (error) {
    console.error("Error updating extra:", error)
    return { isSuccess: false, message: "Failed to update extra" }
  }
}

/**
 * Delete an extra (admin only)
 * 
 * @param id The extra ID to delete
 * @returns Promise<ActionState<void>> Success indicator or an error
 */
export async function deleteExtraAction(
  id: string
): Promise<ActionState<void>> {
  try {
    // Check if user is admin
    // Temporarily commented out for development
    // const { userId } = await auth()
    // const adminId = process.env.ADMIN_USER_ID

    // if (!userId || userId !== adminId) {
    //   return { 
    //     isSuccess: false, 
    //     message: "Unauthorized access" 
    //   }
    // }
    
    // Delete the extra
    await db
      .delete(extrasTable)
      .where(eq(extrasTable.id, id))
    
    return {
      isSuccess: true,
      message: "Extra deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting extra:", error)
    return { isSuccess: false, message: "Failed to delete extra" }
  }
}

/**
 * Toggle the active status of an extra (admin only)
 * 
 * @param id The extra ID to toggle
 * @param isActive The new active status
 * @returns Promise<ActionState<SelectExtra>> The updated extra or an error
 */
export async function toggleExtraStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionState<SelectExtra>> {
  try {
    // Check if user is admin
    // Temporarily commented out for development
    // const { userId } = await auth()
    // const adminId = process.env.ADMIN_USER_ID

    // if (!userId || userId !== adminId) {
    //   return { 
    //     isSuccess: false, 
    //     message: "Unauthorized access" 
    //   }
    // }
    
    // Update the extra's active status
    const [updatedExtra] = await db
      .update(extrasTable)
      .set({
        isActive,
        updatedAt: new Date()
      })
      .where(eq(extrasTable.id, id))
      .returning()
    
    if (!updatedExtra) {
      return { isSuccess: false, message: "Extra not found" }
    }
    
    return {
      isSuccess: true,
      message: `Extra ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedExtra
    }
  } catch (error) {
    console.error("Error toggling extra status:", error)
    return { isSuccess: false, message: "Failed to toggle extra status" }
  }
} 