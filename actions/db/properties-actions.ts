"use server"

import { db } from "@/db/db"
import { InsertProperty, SelectProperty, propertiesTable } from "@/db/schema/properties-schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

/**
 * Get the property data (Since this is a single property website, we just get the first property)
 * 
 * This is used on the public-facing pages to display property details
 * 
 * @returns ActionState with the property data
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
    
    const [updatedProperty] = await db
      .update(propertiesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
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
 * Create a property (Admin only, normally only used for initial setup)
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
    
    // You might want to add more sophisticated admin checks here
    
    // First check if any property already exists
    const existingProperties = await db.query.properties.findMany({
      limit: 1
    })
    
    if (existingProperties.length > 0) {
      return {
        isSuccess: false,
        message: "A property already exists. This site is designed for a single property."
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