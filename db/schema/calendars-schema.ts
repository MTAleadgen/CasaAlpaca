import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const calendarsTable = pgTable("calendars", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCalendar = typeof calendarsTable.$inferInsert
export type SelectCalendar = typeof calendarsTable.$inferSelect
