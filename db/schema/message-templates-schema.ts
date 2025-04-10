import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean
} from "drizzle-orm/pg-core"

export const templateTypeEnum = pgEnum("template_type", [
  "welcome",
  "appointment_reminder",
  "appointment_confirmation",
  "payment_confirmation",
  "follow_up",
  "booking_confirmation",
  "check_in_instructions",
  "custom"
])

// Use the existing trigger_type enum instead of creating a new one
// This must match the values in the database
export const triggerTypeEnum = pgEnum("trigger_type", [
  "booking_created", // When a booking is created
  "check_in", // Check-in day
  "check_out" // Check-out day
])

export const messageTemplatesTable = pgTable("message_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  type: templateTypeEnum("type").notNull(),
  description: text("description"),
  variables: text("variables"), // JSON string of variable names that can be replaced in the template

  // Scheduling fields - match this exactly with the columns we added in the migration
  isScheduled: boolean("is_scheduled").default(false),
  triggerType: triggerTypeEnum("trigger_type"),
  daysOffset: integer("days_offset"),
  hour: integer("hour"),
  minute: integer("minute"),
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertMessageTemplate = typeof messageTemplatesTable.$inferInsert
export type SelectMessageTemplate = typeof messageTemplatesTable.$inferSelect
