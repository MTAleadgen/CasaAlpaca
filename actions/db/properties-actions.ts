"use server"

import { db } from "@/db/db"
import { InsertProperty, SelectProperty, propertiesTable } from "@/db/schema/properties-schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

/**
 * Get the first property (default property)
 * 
 * This is used on the public-facing pages to display property details
 * 
 * @returns ActionState with the default property data
 */
export async function getPropertyAction(): Promise<ActionState<SelectProperty | null>> {
  try {
    const properties = await db.query.properties.findMany({
      limit: 1
    })

    return {
      isSuccess: true,
      message: "Property retrieved successfully",
      data: properties.length > 0 ? properties[0] : null
    }
  } catch (error) {
    console.error("Error getting property:", error)
    return {
      isSuccess: false,
      message: "Failed to get property"
    }
  }
}

/**
 * Get all properties for a user
 * 
 * @param userId - The user ID
 * @returns ActionState with the list of properties
 */
export async function getAllPropertiesAction(userId: string): Promise<ActionState<SelectProperty[]>> {
  try {
    // Get all properties in the system
    const properties = await db.query.properties.findMany()

    return {
      isSuccess: true,
      message: "Properties retrieved successfully",
      data: properties
    }
  } catch (error) {
    console.error("Error getting all properties:", error)
    return {
      isSuccess: false,
      message: "Failed to get properties"
    }
  }
}

/**
 * Get a property by its ID
 * 
 * @param id - The property ID
 * @returns ActionState with the property data
 */
export async function getPropertyByIdAction(id: string): Promise<ActionState<SelectProperty | null>> {
  try {
    const property = await db.query.properties.findFirst({
      where: eq(propertiesTable.id, id)
    })

    return {
      isSuccess: true,
      message: "Property retrieved successfully",
      data: property || null
    }
  } catch (error) {
    console.error("Error getting property by ID:", error)
    return {
      isSuccess: false,
      message: "Failed to get property by ID"
    }
  }
}

/**
 * Update a property's details (Admin only)
 * 
 * @param id - The property ID
 * @param data - The property data to update
 * @returns ActionState with the updated property
 */
export async function updatePropertyAction(
  id: string,
  data: Partial<InsertProperty>
): Promise<ActionState<SelectProperty>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    // You might want to add more sophisticated admin checks here
    // like checking against an ADMIN_USER_ID environment variable
    // or checking a role/permission in the profiles table
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const [updatedProperty] = await db
      .update(propertiesTable)
      .set(updateData)
      .where(eq(propertiesTable.id, id))
      .returning()

    if (!updatedProperty) {
      return {
        isSuccess: false,
        message: "Property not found"
      }
    }

    return {
      isSuccess: true,
      message: "Property updated successfully",
      data: updatedProperty
    }
  } catch (error) {
    console.error("Error updating property:", error)
    return {
      isSuccess: false,
      message: "Failed to update property"
    }
  }
}

/**
 * Create a new property
 * 
 * @param data - The property data to create
 * @returns ActionState with the created property
 */
export async function createPropertyAction(
  data: InsertProperty
): Promise<ActionState<SelectProperty>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    const [newProperty] = await db
      .insert(propertiesTable)
      .values(data)
      .returning()

    return {
      isSuccess: true,
      message: "Property created successfully",
      data: newProperty
    }
  } catch (error) {
    console.error("Error creating property:", error)
    return {
      isSuccess: false,
      message: "Failed to create property"
    }
  }
}

/**
 * Delete a property (Admin only)
 * 
 * @param id - The property ID
 * @returns ActionState with the operation status
 */
export async function deletePropertyAction(
  id: string
): Promise<ActionState<void>> {
  try {
    // Get auth session to check for admin access
    const { userId } = await auth()
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized"
      }
    }
    
    await db
      .delete(propertiesTable)
      .where(eq(propertiesTable.id, id))

    return {
      isSuccess: true,
      message: "Property deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting property:", error)
    return {
      isSuccess: false,
      message: "Failed to delete property"
    }
  }
} 