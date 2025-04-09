/*
Defines the database schema for storing property information.
*/

import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

/**
 * Properties table for storing property information (Casa Alpaca)
 *
 * Since this is a single property website, we expect only one row
 * but designing as a table for flexibility and consistency.
 */
export const propertiesTable = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Casa Alpaca"
  description: text("description").notNull(), // Full property description
  address: text("address").notNull(), // Address string
  propertyType: text("property_type").notNull(), // e.g., "Home"
  listingType: text("listing_type").notNull(), // e.g., "Entire place"
  maxGuests: integer("max_guests").notNull(), // e.g., 4
  specs: jsonb("specs").notNull(), // JSON object with floors, listing floor, built year, sq ft
  rules: jsonb("rules").notNull(), // JSON object with rules (pets, events, smoking, quiet hours, etc.)
  amenities: jsonb("amenities").notNull(), // Array of amenity objects
  photos: jsonb("photos").notNull(), // Array of photo URLs or objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Types
export type InsertProperty = typeof propertiesTable.$inferInsert
export type SelectProperty = typeof propertiesTable.$inferSelect

// Relations - can be expanded when other tables are implemented
export const propertiesRelations = relations(
  propertiesTable,
  ({ one, many }) => ({
    // Will be implemented when other schemas are created
  })
)
