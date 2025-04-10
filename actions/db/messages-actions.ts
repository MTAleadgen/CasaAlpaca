"use server"

import { db } from "@/db/db"
import { messagesTable, SelectMessage } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, desc } from "drizzle-orm"

export async function createMessageAction(
  message: {
    userId: string
    adminId?: string
    phoneNumber: string
    content: string
    direction: "inbound" | "outbound"
    status?: string
    messageId?: string
    mediaUrl?: string
  }
): Promise<ActionState<SelectMessage>> {
  try {
    const [newMessage] = await db
      .insert(messagesTable)
      .values(message)
      .returning()

    return {
      isSuccess: true,
      message: "Message created successfully",
      data: newMessage
    }
  } catch (error) {
    console.error("Error creating message:", error)
    return { isSuccess: false, message: "Failed to create message" }
  }
}

export async function getMessagesAction(
  userId: string
): Promise<ActionState<SelectMessage[]>> {
  try {
    const messages = await db.query.messages.findMany({
      where: eq(messagesTable.userId, userId),
      orderBy: [desc(messagesTable.createdAt)]
    })

    return {
      isSuccess: true,
      message: "Messages retrieved successfully",
      data: messages
    }
  } catch (error) {
    console.error("Error retrieving messages:", error)
    return { isSuccess: false, message: "Failed to retrieve messages" }
  }
}

export async function getMessagesByPhoneAction(
  phoneNumber: string
): Promise<ActionState<SelectMessage[]>> {
  try {
    const messages = await db.query.messages.findMany({
      where: eq(messagesTable.phoneNumber, phoneNumber),
      orderBy: [desc(messagesTable.createdAt)]
    })

    return {
      isSuccess: true,
      message: "Messages retrieved successfully",
      data: messages
    }
  } catch (error) {
    console.error("Error retrieving messages:", error)
    return { isSuccess: false, message: "Failed to retrieve messages" }
  }
}

export async function updateMessageAction(
  id: string,
  data: Partial<{
    status: string
    messageId: string
    mediaUrl: string
  }>
): Promise<ActionState<SelectMessage>> {
  try {
    const [updatedMessage] = await db
      .update(messagesTable)
      .set(data)
      .where(eq(messagesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Message updated successfully",
      data: updatedMessage
    }
  } catch (error) {
    console.error("Error updating message:", error)
    return { isSuccess: false, message: "Failed to update message" }
  }
}

export async function deleteMessageAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(messagesTable).where(eq(messagesTable.id, id))

    return {
      isSuccess: true,
      message: "Message deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting message:", error)
    return { isSuccess: false, message: "Failed to delete message" }
  }
} 