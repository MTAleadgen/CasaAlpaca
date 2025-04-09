/*
Defines the database schema for storing booking information.
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { propertiesTable } from "./properties-schema"
import { extrasTable } from "./extras-schema"

/**
 * Enum for booking status
 * - pending: Initial status when payment intent is created but not confirmed
 * - confirmed: Payment successful, booking confirmed
 * - cancelled: Booking was cancelled (by user or admin)
 * - error: Something went wrong during the booking process
 */
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "error"
])

/**
 * Bookings table for storing reservation information
 */
export const bookingsTable = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => propertiesTable.id)
    .notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull(),
  numGuests: integer("num_guests").notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  priceBreakdown: jsonb("price_breakdown").notNull(), // JSON with base rate, discounts, extras, taxes
  status: bookingStatusEnum("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripePaymentIntentSecret: text("stripe_payment_intent_secret"), // for client-side confirmation
  bookingSource: text("booking_source").notNull().default("direct"), // 'direct', 'vrbo', 'airbnb'
  appliedGiftCardId: uuid("applied_gift_card_id"), // ID of gift card used, if any
  appliedGiftCardAmount: integer("applied_gift_card_amount"), // Amount from gift card (in cents)
  notes: text("notes"), // Optional notes from guest or admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * Booking Extras junction table
 * Links bookings to the extras they've selected
 */
export const bookingExtrasTable = pgTable("booking_extras", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .references(() => bookingsTable.id, { onDelete: "cascade" })
    .notNull(),
  extraId: uuid("extra_id")
    .references(() => extrasTable.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull(), // Price at time of booking (in cents)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Types
export type InsertBooking = typeof bookingsTable.$inferInsert
export type SelectBooking = typeof bookingsTable.$inferSelect

export type InsertBookingExtra = typeof bookingExtrasTable.$inferInsert
export type SelectBookingExtra = typeof bookingExtrasTable.$inferSelect

// Relations
export const bookingsRelations = relations(bookingsTable, ({ one, many }) => ({
  property: one(propertiesTable, {
    fields: [bookingsTable.propertyId],
    references: [propertiesTable.id]
  }),
  extras: many(bookingExtrasTable)
}))

export const bookingExtrasRelations = relations(
  bookingExtrasTable,
  ({ one }) => ({
    booking: one(bookingsTable, {
      fields: [bookingExtrasTable.bookingId],
      references: [bookingsTable.id]
    }),
    extra: one(extrasTable, {
      fields: [bookingExtrasTable.extraId],
      references: [extrasTable.id]
    })
  })
)
