import { db } from "@/db/db"
import { messageTemplatesTable } from "@/db/schema"
import "dotenv/config"

/**
 * This script adds the check-in instructions template to the system
 * Run with: npx tsx scripts/add-checkin-instructions-template.ts
 */

// Template content structured for readability
const CHECKIN_INSTRUCTIONS_TEMPLATE = `Hi {{guestFirstName}},

Thanks again for booking at {{listingName}}!

Looking forward to having you on {{checkInDate}} at {{address}}.

Please let me know when you plan on arriving.

The door code is [the first 4 letters of your first name on a phone]#.

i.e. Sarah would be 7272#

Hold pound to lock when leaving.

Check in is at 4 p.m.

Wifi: {{wifiName}}
Password: {{wifiPassword}}

{{houseManual}}

And here's the house rules again:

{{houseRules}}

Enjoy your stay!

p.s. call me at 330-610-6316 if you need anything at all

Thanks,
Michael`

// Variables used in the template
const TEMPLATE_VARIABLES = [
  "guestFirstName",
  "listingName", 
  "checkInDate",
  "address",
  "wifiName",
  "wifiPassword",
  "houseManual",
  "houseRules"
]

// Function to insert the template for the given user
async function addCheckinInstructionsTemplate(userId: string) {
  try {
    // Check if template already exists
    const existingTemplate = await db.query.messageTemplates.findFirst({
      where: (templates, { and, eq }) => 
        and(
          eq(templates.userId, userId),
          eq(templates.type, "check_in_instructions")
        ) 
    })

    if (existingTemplate) {
      console.log("Check-in instructions template already exists for this user.")
      return
    }

    // Insert the template
    const [newTemplate] = await db.insert(messageTemplatesTable).values({
      userId,
      name: "Check-in Instructions",
      content: CHECKIN_INSTRUCTIONS_TEMPLATE,
      type: "check_in_instructions",
      description: "Sent 3 days before check-in date",
      variables: JSON.stringify(TEMPLATE_VARIABLES)
    }).returning()

    console.log("Check-in instructions template added successfully:", newTemplate.id)
  } catch (error) {
    console.error("Error adding check-in instructions template:", error)
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

  await addCheckinInstructionsTemplate(ADMIN_USER_ID)
  process.exit(0)
}

main() 