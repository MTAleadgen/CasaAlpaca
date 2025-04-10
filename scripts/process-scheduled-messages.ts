import { db } from "@/db/db"
import { bookingsTable, messageTemplatesTable } from "@/db/schema"
import { addDays, isSameDay, format } from "date-fns"
import { eq, and, not, isNull } from "drizzle-orm"
import { sendTemplatedMessageAction } from "@/actions/messaging-actions"
import "dotenv/config"

/**
 * This script processes all scheduled messages that should be sent today
 * It should be run daily via a cron job
 * 
 * Run with: npx tsx scripts/process-scheduled-messages.ts
 */

async function processScheduledMessages() {
  try {
    console.log("Starting scheduled message processing")
    
    // Get admin user ID from environment
    const adminUserId = process.env.ADMIN_USER_ID
    if (!adminUserId) {
      console.error("Error: ADMIN_USER_ID not found in environment variables")
      return
    }

    // Get current date and time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Find all active scheduled templates
    const scheduledTemplates = await db.query.messageTemplates.findMany({
      where: and(
        eq(messageTemplatesTable.isScheduled, true),
        eq(messageTemplatesTable.isActive, true),
        not(isNull(messageTemplatesTable.triggerType))
      )
    })
    
    console.log(`Found ${scheduledTemplates.length} active scheduled templates`)
    
    // Filter templates that should be processed in the current hour
    const templatesForCurrentHour = scheduledTemplates.filter(template => 
      template.hour === currentHour && 
      (template.minute === null || template.minute <= currentMinute)
    )
    
    console.log(`Processing ${templatesForCurrentHour.length} templates for the current hour`)
    
    for (const template of templatesForCurrentHour) {
      try {
        console.log(`Processing template: ${template.name} (${template.id})`)
        
        // Find all bookings that match the trigger criteria
        let targetDate = new Date()
        
        if (template.triggerType === 'check_in') {
          // For check-in triggers, adjust target date by offset
          targetDate = addDays(targetDate, template.daysOffset || 0)
          
          const bookings = await db.query.bookings.findMany({
            where: and(
              not(eq(bookingsTable.status, "cancelled")),
              // We need to check if the dates are the same day
              eq(
                (bookingsTable.checkInDate as any).toString().substring(0, 10),
                targetDate.toISOString().substring(0, 10)
              )
            )
          })
          
          console.log(`Found ${bookings.length} bookings with check-in on ${format(targetDate, 'yyyy-MM-dd')}`)
          
          // Get all properties
          const properties = await db.query.properties.findMany()
          const propertiesMap = new Map(properties.map(p => [p.id, p.name]))
          
          // Process each booking
          for (const booking of bookings) {
            // Extract the first name from the guest name
            const guestFirstName = booking.guestName.split(' ')[0]
            
            // Get property name
            const propertyName = propertiesMap.get(booking.propertyId) || "Casa Alpaca"
            
            // Send the templated message
            await sendTemplatedMessageAction({
              userId: booking.guestPhone,
              phoneNumber: booking.guestPhone,
              templateId: template.id,
              variables: {
                guestFirstName,
                listingName: propertyName,
                checkInDate: format(new Date(booking.checkInDate), "MMMM d, yyyy")
              },
              propertyId: booking.propertyId
            })
            
            console.log(`Sent check-in template to ${booking.guestName} (${booking.guestPhone})`)
          }
        } 
        else if (template.triggerType === 'check_out') {
          // For check-out triggers, adjust target date by offset
          targetDate = addDays(targetDate, template.daysOffset || 0)
          
          const bookings = await db.query.bookings.findMany({
            where: and(
              not(eq(bookingsTable.status, "cancelled")),
              // We need to check if the dates are the same day
              eq(
                (bookingsTable.checkOutDate as any).toString().substring(0, 10),
                targetDate.toISOString().substring(0, 10)
              )
            )
          })
          
          console.log(`Found ${bookings.length} bookings with check-out on ${format(targetDate, 'yyyy-MM-dd')}`)
          
          // Get all properties
          const properties = await db.query.properties.findMany()
          const propertiesMap = new Map(properties.map(p => [p.id, p.name]))
          
          // Process each booking
          for (const booking of bookings) {
            // Extract the first name from the guest name
            const guestFirstName = booking.guestName.split(' ')[0]
            
            // Get property name
            const propertyName = propertiesMap.get(booking.propertyId) || "Casa Alpaca"
            
            // Send the templated message
            await sendTemplatedMessageAction({
              userId: booking.guestPhone,
              phoneNumber: booking.guestPhone,
              templateId: template.id,
              variables: {
                guestFirstName,
                listingName: propertyName,
                checkOutDate: format(new Date(booking.checkOutDate), "MMMM d, yyyy")
              },
              propertyId: booking.propertyId
            })
            
            console.log(`Sent check-out template to ${booking.guestName} (${booking.guestPhone})`)
          }
        }
        else if (template.triggerType === 'booking_created') {
          // For booking created triggers, we'll only process bookings created today
          // minus the daysOffset (negative means before the event)
          targetDate = addDays(targetDate, template.daysOffset || 0)
          
          // Get bookings created today
          const bookings = await db.query.bookings.findMany({
            where: and(
              not(eq(bookingsTable.status, "cancelled")),
              // Find bookings created on the target date
              eq(
                (bookingsTable.createdAt as any).toString().substring(0, 10),
                targetDate.toISOString().substring(0, 10)
              )
            )
          })
          
          console.log(`Found ${bookings.length} bookings created on ${format(targetDate, 'yyyy-MM-dd')}`)
          
          // Get all properties
          const properties = await db.query.properties.findMany()
          const propertiesMap = new Map(properties.map(p => [p.id, p.name]))
          
          // Process each booking
          for (const booking of bookings) {
            // Extract the first name from the guest name
            const guestFirstName = booking.guestName.split(' ')[0]
            
            // Get property name
            const propertyName = propertiesMap.get(booking.propertyId) || "Casa Alpaca"
            
            // Calculate number of nights
            const checkIn = new Date(booking.checkInDate)
            const checkOut = new Date(booking.checkOutDate)
            const numberOfNights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            
            // Send the templated message
            await sendTemplatedMessageAction({
              userId: booking.guestPhone,
              phoneNumber: booking.guestPhone,
              templateId: template.id,
              variables: {
                guestFirstName,
                listingName: propertyName,
                checkInDate: format(checkIn, "MMMM d, yyyy"),
                checkOutDate: format(checkOut, "MMMM d, yyyy"),
                numberOfNights: numberOfNights.toString(),
                // Use a safe default for numberOfGuests if it doesn't exist
                numberOfGuests: (booking as any).numberOfGuests?.toString() || "1"
              },
              propertyId: booking.propertyId
            })
            
            console.log(`Sent booking created template to ${booking.guestName} (${booking.guestPhone})`)
          }
        }
        
        // Update the lastRun timestamp for this template
        await db.update(messageTemplatesTable)
          .set({ lastRun: new Date() })
          .where(eq(messageTemplatesTable.id, template.id))
        
      } catch (error) {
        console.error(`Error processing template ${template.id}:`, error)
      }
    }
    
    console.log("Finished processing scheduled messages")
  } catch (error) {
    console.error("Error processing scheduled messages:", error)
  }
}

// Run the function
processScheduledMessages().then(() => {
  console.log("Scheduled message processing completed")
  process.exit(0)
}).catch(error => {
  console.error("Script failed with error:", error)
  process.exit(1)
}) 