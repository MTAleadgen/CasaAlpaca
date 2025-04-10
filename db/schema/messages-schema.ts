import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  adminId: text("admin_id"),
  phoneNumber: text("phone_number").notNull(),
  content: text("content").notNull(),
  direction: text("direction").notNull(), // "inbound" or "outbound"
  status: text("status").notNull().default("sent"), // "sent", "delivered", "read", "failed"
  messageId: text("message_id"), // WhatsApp message ID for tracking
  mediaUrl: text("media_url"), // URL of any media attached to the message
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertMessage = typeof messagesTable.$inferInsert
export type SelectMessage = typeof messagesTable.$inferSelect
