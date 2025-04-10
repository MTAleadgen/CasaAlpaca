import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean
} from "drizzle-orm/pg-core"
import { triggerTypeEnum } from "./message-templates-schema"

// Table for scheduled message rules
export const messageSchedulesTable = pgTable("message_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  templateId: uuid("template_id").notNull(), // ID of the message template to use
  triggerType: triggerTypeEnum("trigger_type").notNull(),
  daysOffset: integer("days_offset").notNull().default(0), // +/- days from trigger (negative = before, positive = after)
  hour: integer("hour").notNull(), // 0-23 hour of the day
  minute: integer("minute").notNull(), // 0-59 minute of the hour
  isActive: boolean("is_active").notNull().default(true),
  lastRun: timestamp("last_run"), // Track when the schedule was last processed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertMessageSchedule = typeof messageSchedulesTable.$inferInsert
export type SelectMessageSchedule = typeof messageSchedulesTable.$inferSelect
