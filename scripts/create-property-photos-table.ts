/**
 * Script to create the property_photos table in the database
 */

import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { propertyPhotosTable } from '@/db/schema'

async function main() {
  console.log('🔄 Creating property_photos table...')
  
  try {
    const client = postgres(process.env.DATABASE_URL!)
    const db = drizzle(client)
    
    // Check if table exists
    const result = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'property_photos'
      );
    `
    
    const tableExists = result[0]?.exists || false
    
    if (tableExists) {
      console.log('✅ property_photos table already exists')
    } else {
      console.log('🔄 Creating property_photos table...')
      
      // Create the table using SQL
      await client`
        CREATE TABLE IF NOT EXISTS property_photos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL,
          url TEXT NOT NULL,
          alt TEXT,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `
      
      console.log('✅ property_photos table created successfully')
    }
    
    await client.end()
    console.log('✅ Done')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main() 