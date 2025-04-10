/*
Initializes the database connection and schema for the app.
*/

import {
  availabilityBlocksTable,
  bookingsTable,
  bookingExtrasTable,
  extrasTable,
  priceOverridesTable,
  pricingRulesTable,
  pricingSeasonsTable,
  profilesTable,
  propertiesTable,
  propertyPhotosTable,
  calendarsTable,
  calendarSourcesTable,
  messagesTable,
  messageTemplatesTable,
  propertyDetailsTable,
  messageSchedulesTable
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = {
  profiles: profilesTable,
  extras: extrasTable,
  properties: propertiesTable,
  propertyPhotos: propertyPhotosTable,
  bookings: bookingsTable,
  bookingExtras: bookingExtrasTable,
  availabilityBlocks: availabilityBlocksTable,
  pricingRules: pricingRulesTable,
  pricingSeasons: pricingSeasonsTable,
  priceOverrides: priceOverridesTable,
  calendars: calendarsTable,
  calendarSources: calendarSourcesTable,
  messages: messagesTable,
  messageTemplates: messageTemplatesTable,
  propertyDetails: propertyDetailsTable,
  messageSchedules: messageSchedulesTable
}

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
