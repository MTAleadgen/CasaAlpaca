import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core"

/**
 * Extras table for managing bookable extras like early check-in and late check-out
 */
export const extrasTable = pgTable(
  "extras",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").notNull(), // e.g., "early_checkin", "late_checkout", "addon"
    price: integer("price").notNull(), // in cents
    duration: integer("duration"), // in minutes if applicable (e.g. for early check-in)
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  table => {
    return {
      nameIdx: uniqueIndex("extras_name_idx").on(table.name)
    }
  }
)

// Types
export type InsertExtra = typeof extrasTable.$inferInsert
export type SelectExtra = typeof extrasTable.$inferSelect

// Note: We're not defining the relation to bookingExtras here to avoid circular references
// The relation is defined in bookingExtrasRelations in bookings-schema.ts
export const extrasRelations = relations(extrasTable, ({ many }) => ({}))
