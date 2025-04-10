/*
This script initializes the database with a default property and pricing rule
Run with: npx tsx scripts/init-db.ts
*/

import { db } from "@/db/db"
import { propertiesTable } from "@/db/schema"
import postgres from "postgres"
import { config } from "dotenv"

config({ path: ".env.local" })

async function main() {
  try {
    console.log("🔄 Initializing database...")
    
    // First, let's check if the tables exist in the database
    const client = postgres(process.env.DATABASE_URL!)
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    
    const tableNames = tables.map(t => t.table_name)
    console.log("📋 Existing tables:", tableNames.join(", "))
    
    if (!tableNames.includes('properties')) {
      console.log("⚠️ The properties table doesn't exist yet. Please run migrations first.")
      return
    }
    
    // Check if a property already exists
    const existingProperties = await db.select().from(propertiesTable).limit(1)
    
    let propertyId: string
    
    if (existingProperties.length === 0) {
      // Create a default property
      console.log("➕ Creating default property...")
      const [property] = await db.insert(propertiesTable)
        .values({
          name: "Casa Alpaca",
          description: "Beautiful mountainside retreat with spectacular views."
        })
        .returning()
      
      propertyId = property.id
      console.log(`✅ Property created with ID: ${propertyId}`)
    } else {
      propertyId = existingProperties[0].id
      console.log(`ℹ️ Using existing property with ID: ${propertyId}`)
    }
    
    // Initialize pricing rules
    if (!tableNames.includes('pricing_rules')) {
      console.log("⚠️ The pricing_rules table doesn't exist yet.")
      return
    }
    
    // Check if there are pricing rules for this property
    const existingRules = await client`
      SELECT id, type FROM pricing_rules 
      WHERE property_id = ${propertyId}
    `
    
    if (existingRules.length === 0) {
      // Create baseline pricing rule
      console.log("➕ Creating default base pricing rule...")
      
      await client`
        INSERT INTO pricing_rules (
          property_id, 
          type, 
          baseline_weekday_price, 
          baseline_weekend_price, 
          is_enabled,
          created_at,
          updated_at
        ) 
        VALUES (
          ${propertyId}, 
          'baseline', 
          ${10000}, 
          ${15000}, 
          ${true},
          now(),
          now()
        )
        RETURNING id
      `
      
      console.log("✅ Base rate pricing rule created")
    } else {
      console.log("ℹ️ Pricing rules already exist:")
      existingRules.forEach(rule => {
        console.log(`  - ${rule.type}`)
      })
      
      // Update the baseline price rule if it exists
      const baselineRule = existingRules.find(r => r.type === 'baseline')
      if (baselineRule) {
        console.log("🔄 Updating baseline pricing rule...")
        
        await client`
          UPDATE pricing_rules
          SET 
            baseline_weekday_price = ${10000},
            baseline_weekend_price = ${15000},
            updated_at = now()
          WHERE id = ${baselineRule.id}
        `
        
        console.log("✅ Baseline pricing rule updated")
      }
    }
    
    // Initialize pricing seasons table
    if (tableNames.includes('pricing_seasons')) {
      console.log("➕ Checking pricing seasons...")
      
      // Check if there are already seasons
      const existingSeasons = await client`
        SELECT id FROM pricing_seasons
        WHERE property_id = ${propertyId}
        LIMIT 1
      `
      
      if (existingSeasons.length === 0) {
        const now = new Date()
        const summerStart = new Date(now.getFullYear(), 5, 1) // June 1
        const summerEnd = new Date(now.getFullYear(), 8, 30) // Sept 30
        
        await client`
          INSERT INTO pricing_seasons (
            property_id,
            name,
            start_date,
            end_date,
            weekday_rate,
            weekend_rate,
            created_at,
            updated_at
          )
          VALUES (
            ${propertyId},
            ${'Summer Season'},
            ${summerStart.toISOString().split('T')[0]},
            ${summerEnd.toISOString().split('T')[0]},
            ${12500},
            ${17500},
            now(),
            now()
          )
        `
        
        console.log("✅ Summer season pricing created")
      } else {
        console.log("ℹ️ Pricing seasons already exist for this property")
      }
    }
    
    // Add a price override for a specific date
    if (tableNames.includes('price_overrides')) {
      console.log("➕ Checking price overrides...")
      
      // Create a date 7 days from now
      const overrideDate = new Date()
      overrideDate.setDate(overrideDate.getDate() + 7)
      const overrideDateString = overrideDate.toISOString().split('T')[0]
      
      // Check if there's already an override for this date
      const existingOverride = await client`
        SELECT id FROM price_overrides
        WHERE property_id = ${propertyId}
        AND date = ${overrideDateString}
        LIMIT 1
      `
      
      if (existingOverride.length === 0) {
        await client`
          INSERT INTO price_overrides (
            property_id,
            date,
            price,
            reason,
            created_at,
            updated_at
          )
          VALUES (
            ${propertyId},
            ${overrideDateString},
            ${20000},
            ${'Special event'},
            now(),
            now()
          )
        `
        
        console.log(`✅ Price override created for ${overrideDateString}`)
      } else {
        console.log(`ℹ️ Price override already exists for ${overrideDateString}`)
      }
    }
    
    console.log("✅ Database initialization complete!")
  } catch (error) {
    console.error("❌ Error initializing database:", error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main() 