import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const calendarSourcesTable = pgTable("calendar_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCalendarSource = typeof calendarSourcesTable.$inferInsert
export type SelectCalendarSource = typeof calendarSourcesTable.$inferSelect
