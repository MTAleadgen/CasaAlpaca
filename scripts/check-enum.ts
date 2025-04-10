/*
This script checks the values of enums in the database
Run with: npx tsx scripts/check-enum.ts
*/

import postgres from "postgres"
import { config } from "dotenv"

config({ path: ".env.local" })

async function main() {
  try {
    console.log("🔍 Checking enum values in the database...")
    const client = postgres(process.env.DATABASE_URL!)
    
    // Get all enum types
    const enumTypes = await client`
      SELECT
          t.typname AS enum_name,
          e.enumlabel AS enum_value
      FROM
          pg_type t
      JOIN
          pg_enum e ON t.oid = e.enumtypid
      JOIN
          pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE
          n.nspname = 'public'
      ORDER BY
          enum_name, e.enumsortorder;
    `
    
    // Group by enum name
    const enums: Record<string, string[]> = {}
    
    for (const row of enumTypes) {
      if (!enums[row.enum_name]) {
        enums[row.enum_name] = []
      }
      enums[row.enum_name].push(row.enum_value)
    }
    
    // Print results
    for (const [enumName, values] of Object.entries(enums)) {
      console.log(`\n📊 Enum: ${enumName}`)
      console.log(`  Values: ${values.join(', ')}`)
    }
    
  } catch (error) {
    console.error("❌ Error checking enum values:", error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main() 