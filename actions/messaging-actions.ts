"use server"

import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getMessageTemplateByIdAction } from "@/actions/db/message-templates-actions" 
import { getPropertyDetailAction } from "@/actions/db/property-details-actions"
import { sendWhatsAppMessageAction } from "@/actions/whatsapp-actions"
import { sendSmsAction } from "@/actions/sms-actions"
import { auth } from "@clerk/nextjs/server"
import { ActionState } from "@/types"

interface SendTemplatedMessageParams {
  userId: string                // ID of the user receiving the message
  phoneNumber: string           // Phone number to send the message to
  templateId: string            // ID of the template to use
  variables?: Record<string, string> // Optional variables to replace in the template
  propertyId?: string           // Optional property ID to include property details as variables
}

/**
 * Send a templated message through the user's preferred channel (WhatsApp or SMS)
 */
export async function sendTemplatedMessageAction({
  userId,
  phoneNumber,
  templateId,
  variables = {},
  propertyId
}: SendTemplatedMessageParams): Promise<ActionState<{ messageId: string }>> {
  try {
    // Get the authenticated user
    const session = await auth()
    const senderUserId = session?.userId
    
    if (!senderUserId) {
      return {
        isSuccess: false,
        message: "User not authenticated"
      }
    }
    
    // Get the message template
    const templateResult = await getMessageTemplateByIdAction(templateId)
    if (!templateResult.isSuccess) {
      return {
        isSuccess: false,
        message: `Failed to get template: ${templateResult.message}`
      }
    }
    
    const template = templateResult.data
    
    // Process template variables
    let messageContent = template.content
    let allVariables = { ...variables }
    
    // If propertyId is provided, get property details and add them as variables
    if (propertyId) {
      const propertyResult = await getPropertyDetailAction(senderUserId, propertyId)
      if (propertyResult.isSuccess) {
        const property = propertyResult.data
        
        // Add property details as variables
        allVariables = {
          ...allVariables,
          address: property.address || '',
          houseRules: property.houseRules || '',
          wifiName: property.wifiName || '',
          wifiPassword: property.wifiPassword || '',
          listingName: property.listingName || '',
          checkInInstructions: property.checkInInstructions || '',
          checkOutInstructions: property.checkOutInstructions || '',
          emergencyContact: property.emergencyContact || '',
          localRecommendations: property.localRecommendations || ''
        }
      }
    }
    
    // Replace variables in the template content
    if (template.variables) {
      try {
        const templateVariables = JSON.parse(template.variables)
        
        // Replace each variable in the content
        for (const key of templateVariables) {
          const placeholder = `{{${key}}}`
          const value = allVariables[key] || ""
          messageContent = messageContent.replace(new RegExp(placeholder, "g"), value)
        }
      } catch (error) {
        console.warn("Error parsing template variables:", error)
      }
    }
    
    // Get user profile to determine preferred messaging channel
    const profileResult = await getProfileByUserIdAction(userId)
    if (!profileResult.isSuccess) {
      return {
        isSuccess: false,
        message: `Failed to get user profile: ${profileResult.message}`
      }
    }
    
    const profile = profileResult.data
    const messagingPreference = profile.messagingPreference || "sms"
    
    // Send the message through the preferred channel
    let result
    
    if (messagingPreference === "whatsapp") {
      result = await sendWhatsAppMessageAction(
        phoneNumber,
        messageContent,
        senderUserId
      )
    } else {
      result = await sendSmsAction(
        phoneNumber,
        messageContent,
        senderUserId
      )
    }
    
    if (!result.isSuccess) {
      return {
        isSuccess: false,
        message: `Failed to send message: ${result.message}`
      }
    }
    
    return {
      isSuccess: true,
      message: `Message sent successfully via ${messagingPreference}`,
      data: { messageId: result.data.messageId }
    }
  } catch (error) {
    console.error("Error sending templated message:", error)
    return {
      isSuccess: false,
      message: `Failed to send templated message: ${error instanceof Error ? error.message : String(error)}`
    }
  }
} 