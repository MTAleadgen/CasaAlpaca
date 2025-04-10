/*
This script inspects the database schema to understand the table structure
Run with: npx tsx scripts/inspect-schema.ts
*/

import postgres from "postgres"
import { config } from "dotenv"

config({ path: ".env.local" })

async function main() {
  try {
    console.log("🔍 Inspecting database schema...")
    const client = postgres(process.env.DATABASE_URL!)
    
    // Get all tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    
    console.log("📋 Tables:", tables.map(t => t.table_name).join(", "))
    
    // For each table, get its columns
    for (const table of tables) {
      const columns = await client`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
      `
      
      console.log(`\n📊 Table: ${table.table_name}`)
      columns.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type})${column.is_nullable === 'YES' ? ' [nullable]' : ''}`)
      })
    }
    
  } catch (error) {
    console.error("❌ Error inspecting database schema:", error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main() 