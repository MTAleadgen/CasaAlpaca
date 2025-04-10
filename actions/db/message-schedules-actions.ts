"use server"

import { db } from "@/db/db"
import { InsertMessageSchedule, SelectMessageSchedule, messageSchedulesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and } from "drizzle-orm"

export async function createMessageScheduleAction(
  schedule: InsertMessageSchedule
): Promise<ActionState<SelectMessageSchedule>> {
  try {
    const [newSchedule] = await db
      .insert(messageSchedulesTable)
      .values(schedule)
      .returning()
    
    return {
      isSuccess: true,
      message: "Message schedule created successfully",
      data: newSchedule
    }
  } catch (error) {
    console.error("Error creating message schedule:", error)
    return { isSuccess: false, message: "Failed to create message schedule" }
  }
}

export async function getMessageSchedulesAction(
  userId: string
): Promise<ActionState<SelectMessageSchedule[]>> {
  try {
    const schedules = await db.query.messageSchedules.findMany({
      where: eq(messageSchedulesTable.userId, userId),
      orderBy: [
        messageSchedulesTable.triggerType,
        messageSchedulesTable.daysOffset
      ]
    })
    
    return {
      isSuccess: true,
      message: "Message schedules retrieved successfully",
      data: schedules
    }
  } catch (error) {
    console.error("Error getting message schedules:", error)
    return { isSuccess: false, message: "Failed to get message schedules" }
  }
}

export async function getMessageScheduleByIdAction(
  id: string
): Promise<ActionState<SelectMessageSchedule>> {
  try {
    const schedule = await db.query.messageSchedules.findFirst({
      where: eq(messageSchedulesTable.id, id)
    })
    
    if (!schedule) {
      return { isSuccess: false, message: "Message schedule not found" }
    }
    
    return {
      isSuccess: true,
      message: "Message schedule retrieved successfully",
      data: schedule
    }
  } catch (error) {
    console.error("Error getting message schedule:", error)
    return { isSuccess: false, message: "Failed to get message schedule" }
  }
}

export async function updateMessageScheduleAction(
  id: string,
  data: Partial<InsertMessageSchedule>
): Promise<ActionState<SelectMessageSchedule>> {
  try {
    const [updatedSchedule] = await db
      .update(messageSchedulesTable)
      .set(data)
      .where(eq(messageSchedulesTable.id, id))
      .returning()
    
    if (!updatedSchedule) {
      return { isSuccess: false, message: "Message schedule not found" }
    }
    
    return {
      isSuccess: true,
      message: "Message schedule updated successfully",
      data: updatedSchedule
    }
  } catch (error) {
    console.error("Error updating message schedule:", error)
    return { isSuccess: false, message: "Failed to update message schedule" }
  }
}

export async function deleteMessageScheduleAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(messageSchedulesTable).where(eq(messageSchedulesTable.id, id))
    
    return {
      isSuccess: true,
      message: "Message schedule deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting message schedule:", error)
    return { isSuccess: false, message: "Failed to delete message schedule" }
  }
}

export async function toggleMessageScheduleAction(
  id: string,
  isActive: boolean
): Promise<ActionState<SelectMessageSchedule>> {
  try {
    const [updatedSchedule] = await db
      .update(messageSchedulesTable)
      .set({ isActive })
      .where(eq(messageSchedulesTable.id, id))
      .returning()
    
    if (!updatedSchedule) {
      return { isSuccess: false, message: "Message schedule not found" }
    }
    
    return {
      isSuccess: true,
      message: `Message schedule ${isActive ? 'enabled' : 'disabled'} successfully`,
      data: updatedSchedule
    }
  } catch (error) {
    console.error("Error toggling message schedule:", error)
    return { isSuccess: false, message: "Failed to toggle message schedule" }
  }
} 