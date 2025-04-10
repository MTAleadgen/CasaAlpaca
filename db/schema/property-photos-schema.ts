import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { propertiesTable } from "./properties-schema"
import { relations } from "drizzle-orm"

export const propertyPhotosTable = pgTable("property_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => propertiesTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertPropertyPhoto = typeof propertyPhotosTable.$inferInsert
export type SelectPropertyPhoto = typeof propertyPhotosTable.$inferSelect

// Define relations for property photos
export const propertyPhotosRelations = relations(
  propertyPhotosTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [propertyPhotosTable.propertyId],
      references: [propertiesTable.id]
    })
  })
)
