/*
Defines the database schema for storing availability blocks.
These blocks represent periods when a property is not available for booking
(either due to manual blocks or external bookings from platforms like VRBO/Airbnb).
*/

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { propertiesTable } from "./properties-schema"

/**
 * Enum for block sources
 * - manual: Block manually added by admin
 * - ical_vrbo: Block imported from VRBO iCal feed
 * - ical_airbnb: Block imported from Airbnb iCal feed
 * - direct_booking: Block created automatically when a direct booking is confirmed
 */
export const blockSourceEnum = pgEnum("block_source", [
  "manual",
  "ical_vrbo",
  "ical_airbnb",
  "direct_booking"
])

/**
 * Availability Blocks table for storing periods when property is unavailable
 */
export const availabilityBlocksTable = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => propertiesTable.id)
    .notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"), // Optional description of why block exists
  source: blockSourceEnum("source").notNull(),
  externalEventId: text("external_event_id"), // iCal UID for synced events
  externalSyncData: text("external_sync_data"), // Other data from external source if needed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Types
export type InsertAvailabilityBlock =
  typeof availabilityBlocksTable.$inferInsert
export type SelectAvailabilityBlock =
  typeof availabilityBlocksTable.$inferSelect

// Relations
export const availabilityBlocksRelations = relations(
  availabilityBlocksTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [availabilityBlocksTable.propertyId],
      references: [propertiesTable.id]
    })
  })
)
