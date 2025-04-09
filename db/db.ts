/*
Initializes the database connection and schema for the app.
*/

import {
  availabilityBlocksTable,
  bookingExtrasTable,
  bookingsTable,
  extrasTable,
  priceOverridesTable,
  pricingRulesTable,
  pricingSeasonsTable,
  profilesTable,
  propertiesTable
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = {
  profiles: profilesTable,
  extras: extrasTable,
  properties: propertiesTable,
  bookings: bookingsTable,
  bookingExtras: bookingExtrasTable,
  availabilityBlocks: availabilityBlocksTable,
  pricingRules: pricingRulesTable,
  pricingSeasons: pricingSeasonsTable,
  priceOverrides: priceOverridesTable
}

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
