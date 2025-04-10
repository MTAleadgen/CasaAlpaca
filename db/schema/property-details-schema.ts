import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const propertyDetailsTable = pgTable("property_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  propertyId: text("property_id").notNull(),
  address: text("address"),
  houseRules: text("house_rules"),
  wifiName: text("wifi_name"),
  wifiPassword: text("wifi_password"),
  listingName: text("listing_name"),
  checkInInstructions: text("check_in_instructions"),
  checkOutInstructions: text("check_out_instructions"),
  emergencyContact: text("emergency_contact"),
  localRecommendations: text("local_recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertPropertyDetail = typeof propertyDetailsTable.$inferInsert
export type SelectPropertyDetail = typeof propertyDetailsTable.$inferSelect
