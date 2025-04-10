"use server"

import { auth } from "@clerk/nextjs/server"
import { randomUUID } from "crypto"
import { createClient } from '@supabase/supabase-js'

import { ActionState } from "@/types"
import { db } from "@/db/db"
import { InsertPropertyPhoto, propertyPhotosTable, SelectPropertyPhoto } from "@/db/schema"
import { eq } from "drizzle-orm"

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const PROPERTY_PHOTOS_BUCKET = process.env.PROPERTY_PHOTOS_BUCKET || "property-photos"

// Property photo actions
export async function uploadPropertyPhotoAction({
  propertyId,
  file
}: {
  propertyId: string
  file: File
}): Promise<ActionState<SelectPropertyPhoto>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized - please log in" }
    }

    // Validate file
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return { isSuccess: false, message: "Invalid file type. Only JPG, PNG, and WebP are allowed" }
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { isSuccess: false, message: "File size exceeds 5MB limit" }
    }

    // Create a Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExt}`
    const filePath = `${userId}/${propertyId}/${fileName}`

    // Upload to Supabase storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(PROPERTY_PHOTOS_BUCKET)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      })

    if (storageError) {
      console.error("Storage error:", storageError)
      return { isSuccess: false, message: "Failed to upload file to storage" }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(PROPERTY_PHOTOS_BUCKET)
      .getPublicUrl(filePath)

    // Get current photo count for position
    const existingPhotos = await db.query.propertyPhotos.findMany({
      where: eq(propertyPhotosTable.propertyId, propertyId)
    })
    
    // Insert record into database
    const [newPhoto] = await db.insert(propertyPhotosTable).values({
      propertyId,
      userId,
      url: publicUrlData.publicUrl,
      alt: `Property photo ${existingPhotos.length + 1}`,
      position: existingPhotos.length
    }).returning()

    return {
      isSuccess: true,
      message: "Photo uploaded successfully",
      data: newPhoto
    }
  } catch (error) {
    console.error("Error uploading property photo:", error)
    return { isSuccess: false, message: "Failed to upload property photo" }
  }
}

export async function getPropertyPhotosAction(
  propertyId: string
): Promise<ActionState<SelectPropertyPhoto[]>> {
  try {
    const photos = await db.query.propertyPhotos.findMany({
      where: eq(propertyPhotosTable.propertyId, propertyId),
      orderBy: (propertyPhotos) => [propertyPhotos.position]
    })

    return {
      isSuccess: true,
      message: "Property photos retrieved successfully",
      data: photos
    }
  } catch (error) {
    console.error("Error retrieving property photos:", error)
    return { isSuccess: false, message: "Failed to retrieve property photos" }
  }
}

export async function deletePropertyPhotoAction({
  propertyId,
  photoId
}: {
  propertyId: string
  photoId: string
}): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized - please log in" }
    }

    // Create a Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the photo details first
    const [photo] = await db.select()
      .from(propertyPhotosTable)
      .where(eq(propertyPhotosTable.id, photoId))
      .limit(1)

    if (!photo) {
      return { isSuccess: false, message: "Photo not found" }
    }

    // Extract filename from URL to delete from storage
    const url = new URL(photo.url)
    const pathParts = url.pathname.split('/')
    const storagePath = pathParts.slice(pathParts.indexOf(PROPERTY_PHOTOS_BUCKET) + 1).join('/')

    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from(PROPERTY_PHOTOS_BUCKET)
      .remove([storagePath])

    if (storageError) {
      console.error("Storage error:", storageError)
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    await db.delete(propertyPhotosTable)
      .where(eq(propertyPhotosTable.id, photoId))

    // Reorder remaining photos
    const remainingPhotos = await db.select()
      .from(propertyPhotosTable)
      .where(eq(propertyPhotosTable.propertyId, propertyId))
      .orderBy(propertyPhotosTable.position)

    // Update positions
    for (let i = 0; i < remainingPhotos.length; i++) {
      await db.update(propertyPhotosTable)
        .set({ position: i })
        .where(eq(propertyPhotosTable.id, remainingPhotos[i].id))
    }

    return {
      isSuccess: true,
      message: "Photo deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting property photo:", error)
    return { isSuccess: false, message: "Failed to delete property photo" }
  }
}

export async function updatePhotoPositionsAction({
  photos
}: {
  photos: { id: string; position: number }[]
}): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized - please log in" }
    }

    // Update positions for each photo
    for (const photo of photos) {
      await db.update(propertyPhotosTable)
        .set({ position: photo.position })
        .where(eq(propertyPhotosTable.id, photo.id))
    }

    return {
      isSuccess: true,
      message: "Photo positions updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating photo positions:", error)
    return { isSuccess: false, message: "Failed to update photo positions" }
  }
} 