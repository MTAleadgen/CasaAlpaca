import { db } from "@/db/db"
import { messageTemplatesTable } from "@/db/schema"
import { auth } from "@clerk/nextjs/server"
import "dotenv/config"

/**
 * This script adds the default booking confirmation template to the system
 * Run with: npx tsx scripts/add-booking-confirmation-template.ts
 */

// Template content structured for readability
const BOOKING_CONFIRMATION_TEMPLATE = `Hi {{guestFirstName}}, and thanks for your reservation!

I wanted to confirm your reservation at {{listingName}} starting on {{checkInDate}} for {{numberOfNights}} nights with {{numberOfGuests}} guests.

If you need any more info, don't hesitate to ask. Happy to answer any questions you may have.

You will receive a message a few days before your arrival with the check-in instructions.

Can't wait to have you!

Best, Michael`

// Variables used in the template
const TEMPLATE_VARIABLES = [
  "guestFirstName",
  "listingName", 
  "checkInDate",
  "numberOfNights",
  "numberOfGuests"
]

// Function to insert the template for the given user
async function addBookingConfirmationTemplate(userId: string) {
  try {
    // Check if template already exists
    const existingTemplate = await db.query.messageTemplates.findFirst({
      where: (templates, { and, eq }) => 
        and(
          eq(templates.userId, userId),
          eq(templates.type, "booking_confirmation")
        ) 
    })

    if (existingTemplate) {
      console.log("Booking confirmation template already exists for this user.")
      return
    }

    // Insert the template
    const [newTemplate] = await db.insert(messageTemplatesTable).values({
      userId,
      name: "Booking Confirmation",
      content: BOOKING_CONFIRMATION_TEMPLATE,
      type: "booking_confirmation",
      description: "Sent immediately after booking a stay",
      variables: JSON.stringify(TEMPLATE_VARIABLES)
    }).returning()

    console.log("Booking confirmation template added successfully:", newTemplate.id)
  } catch (error) {
    console.error("Error adding booking confirmation template:", error)
  }
}

// Get the user ID from command line or environment variables
async function main() {
  // Get admin user ID from environment
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID

  if (!ADMIN_USER_ID) {
    console.error("Error: ADMIN_USER_ID not found in environment variables")
    process.exit(1)
  }

  await addBookingConfirmationTemplate(ADMIN_USER_ID)
  process.exit(0)
}

main() 