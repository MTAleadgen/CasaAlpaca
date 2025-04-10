"use server"

import { db } from "@/db/db"
import { InsertMessageTemplate, SelectMessageTemplate, messageTemplatesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export async function createMessageTemplateAction(
  template: InsertMessageTemplate
): Promise<ActionState<SelectMessageTemplate>> {
  try {
    const [newTemplate] = await db
      .insert(messageTemplatesTable)
      .values(template)
      .returning()
    
    return {
      isSuccess: true,
      message: "Message template created successfully",
      data: newTemplate
    }
  } catch (error) {
    console.error("Error creating message template:", error)
    return { isSuccess: false, message: "Failed to create message template" }
  }
}

export async function getMessageTemplatesAction(
  userId: string
): Promise<ActionState<SelectMessageTemplate[]>> {
  try {
    const templates = await db.query.messageTemplates.findMany({
      where: eq(messageTemplatesTable.userId, userId),
      orderBy: messageTemplatesTable.name
    })
    
    return {
      isSuccess: true,
      message: "Message templates retrieved successfully",
      data: templates
    }
  } catch (error) {
    console.error("Error getting message templates:", error)
    return { isSuccess: false, message: "Failed to get message templates" }
  }
}

export async function getMessageTemplateByIdAction(
  id: string
): Promise<ActionState<SelectMessageTemplate>> {
  try {
    const template = await db.query.messageTemplates.findFirst({
      where: eq(messageTemplatesTable.id, id)
    })
    
    if (!template) {
      return { isSuccess: false, message: "Message template not found" }
    }
    
    return {
      isSuccess: true,
      message: "Message template retrieved successfully",
      data: template
    }
  } catch (error) {
    console.error("Error getting message template:", error)
    return { isSuccess: false, message: "Failed to get message template" }
  }
}

export async function updateMessageTemplateAction(
  id: string,
  data: Partial<InsertMessageTemplate>
): Promise<ActionState<SelectMessageTemplate>> {
  try {
    const [updatedTemplate] = await db
      .update(messageTemplatesTable)
      .set(data)
      .where(eq(messageTemplatesTable.id, id))
      .returning()
    
    if (!updatedTemplate) {
      return { isSuccess: false, message: "Message template not found" }
    }
    
    return {
      isSuccess: true,
      message: "Message template updated successfully",
      data: updatedTemplate
    }
  } catch (error) {
    console.error("Error updating message template:", error)
    return { isSuccess: false, message: "Failed to update message template" }
  }
}

export async function deleteMessageTemplateAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(messageTemplatesTable).where(eq(messageTemplatesTable.id, id))
    
    return {
      isSuccess: true,
      message: "Message template deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting message template:", error)
    return { isSuccess: false, message: "Failed to delete message template" }
  }
} 