/*
Defines the database schema for storing property information.
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { propertyPhotosTable } from "./property-photos-schema"

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
    photos: many(propertyPhotosTable)
  })
)
