/*
Defines the database schema for pricing rules, seasons, and price overrides.
These schemas handle the dynamic pricing engine for Casa Alpaca.
*/

import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  date,
  uniqueIndex
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { propertiesTable } from "./properties-schema"

/**
 * Pricing Rules table for storing base weekday/weekend rates and LOS discount settings
 * There should be only one entry per property
 */
export const pricingRulesTable = pgTable(
  "pricing_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .references(() => propertiesTable.id)
      .notNull(),
    baseWeekdayRate: integer("base_weekday_rate").notNull(), // in cents
    baseWeekendRate: integer("base_weekend_rate").notNull(), // in cents
    losDiscountThreshold: integer("los_discount_threshold").default(2), // e.g., 2 nights
    losDiscountAmount: integer("los_discount_amount").default(0), // flat rate in cents
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => {
    return {
      propertyIdIdx: uniqueIndex("pricing_rules_property_id_idx").on(
        table.propertyId
      )
    }
  }
)

/**
 * Pricing Seasons table for storing seasonal rate adjustments
 * e.g., High Season, Low Season, Holiday Season, etc.
 */
export const pricingSeasonsTable = pgTable("pricing_seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => propertiesTable.id)
    .notNull(),
  name: text("name").notNull(), // e.g., "High Season", "Low Season"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  weekdayRate: integer("weekday_rate").notNull(), // in cents
  weekendRate: integer("weekend_rate").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * Price Overrides table for storing date-specific price overrides
 * These take precedence over seasonal and base rates
 */
export const priceOverridesTable = pgTable(
  "price_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .references(() => propertiesTable.id)
      .notNull(),
    date: date("date").notNull(),
    price: integer("price").notNull(), // in cents
    reason: text("reason"), // Optional reason for the override
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => {
    return {
      propertyDateIdx: uniqueIndex("price_overrides_property_date_idx").on(
        table.propertyId,
        table.date
      )
    }
  }
)

// Types
export type InsertPricingRule = typeof pricingRulesTable.$inferInsert
export type SelectPricingRule = typeof pricingRulesTable.$inferSelect

export type InsertPricingSeason = typeof pricingSeasonsTable.$inferInsert
export type SelectPricingSeason = typeof pricingSeasonsTable.$inferSelect

export type InsertPriceOverride = typeof priceOverridesTable.$inferInsert
export type SelectPriceOverride = typeof priceOverridesTable.$inferSelect

// Relations
export const pricingRulesRelations = relations(
  pricingRulesTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [pricingRulesTable.propertyId],
      references: [propertiesTable.id]
    })
  })
)

export const pricingSeasonsRelations = relations(
  pricingSeasonsTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [pricingSeasonsTable.propertyId],
      references: [propertiesTable.id]
    })
  })
)

export const priceOverridesRelations = relations(
  priceOverridesTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [priceOverridesTable.propertyId],
      references: [propertiesTable.id]
    })
  })
)
