import { db } from "@/db/db"
import "dotenv/config"

/**
 * This script adds scheduling fields to the message_templates table
 * Run with: npx tsx scripts/add-scheduling-to-templates.ts
 */

async function addSchedulingToTemplates() {
  try {
    console.log("Starting migration to add scheduling fields to message_templates table")
    
    // Check if trigger_type enum already exists from message-schedules
    try {
      await db.execute(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trigger_type') THEN
            -- Create the enum only if it doesn't exist
            CREATE TYPE trigger_type AS ENUM ('booking_created', 'check_in', 'check_out');
            RAISE NOTICE 'Created trigger_type enum';
          ELSE
            RAISE NOTICE 'trigger_type enum already exists';
          END IF;
        END$$;
      `)
      console.log("Verified trigger_type enum exists")
    } catch (error) {
      console.error("Error checking trigger_type enum:", error)
      return
    }
    
    // Add the scheduling columns to the message_templates table
    // Using raw SQL to safely add columns only if they don't exist
    const alterTableResult = await db.execute(`
      DO $$
      BEGIN
        -- Add is_scheduled column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'message_templates' AND column_name = 'is_scheduled') THEN
          ALTER TABLE message_templates ADD COLUMN is_scheduled BOOLEAN NOT NULL DEFAULT FALSE;
          RAISE NOTICE 'Added is_scheduled column';
        ELSE
          RAISE NOTICE 'is_scheduled column already exists';
        END IF;
        
        -- Add trigger_type column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'message_templates' AND column_name = 'trigger_type') THEN
          ALTER TABLE message_templates ADD COLUMN trigger_type trigger_type;
          RAISE NOTICE 'Added trigger_type column';
        ELSE
          RAISE NOTICE 'trigger_type column already exists';
        END IF;
        
        -- Add days_offset column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'message_templates' AND column_name = 'days_offset') THEN
          ALTER TABLE message_templates ADD COLUMN days_offset INTEGER;
          RAISE NOTICE 'Added days_offset column';
        ELSE
          RAISE NOTICE 'days_offset column already exists';
        END IF;
        
        -- Add hour column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'message_templates' AND column_name = 'hour') THEN
          ALTER TABLE message_templates ADD COLUMN hour INTEGER;
          RAISE NOTICE 'Added hour column';
        ELSE
          RAISE NOTICE 'hour column already exists';
        END IF;
        
        -- Add minute column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'message_templates' AND column_name = 'minute') THEN
          ALTER TABLE message_templates ADD COLUMN minute INTEGER;
          RAISE NOTICE 'Added minute column';
        ELSE
          RAISE NOTICE 'minute column already exists';
        END IF;
        
        -- Add is_active column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'message_templates' AND column_name = 'is_active') THEN
          ALTER TABLE message_templates ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
          RAISE NOTICE 'Added is_active column';
        ELSE
          RAISE NOTICE 'is_active column already exists';
        END IF;
        
        -- Add last_run column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'message_templates' AND column_name = 'last_run') THEN
          ALTER TABLE message_templates ADD COLUMN last_run TIMESTAMP;
          RAISE NOTICE 'Added last_run column';
        ELSE
          RAISE NOTICE 'last_run column already exists';
        END IF;
      END$$;
    `)
    
    console.log("Successfully added scheduling fields to message_templates table")
    
    // Migrate existing templates from message_schedules table if it exists
    try {
      const checkTableExists = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'message_schedules'
        );
      `)
      
      // Access the result from the checkTableExists query safely
      const tableExistsValue = Array.isArray(checkTableExists) && checkTableExists.length > 0 
        ? checkTableExists[0]?.exists
        : (checkTableExists as any)?.rows?.[0]?.exists
      
      if (tableExistsValue) {
        console.log("Found message_schedules table, attempting to migrate data")
        
        // Transfer data from message_schedules to message_templates
        await db.execute(`
          UPDATE message_templates mt
          SET 
            is_scheduled = TRUE,
            trigger_type = ms.trigger_type,
            days_offset = ms.days_offset,
            hour = ms.hour,
            minute = ms.minute,
            is_active = ms.is_active,
            last_run = ms.last_run
          FROM message_schedules ms
          WHERE ms.template_id = mt.id;
        `)
        
        console.log("Successfully migrated scheduling data from message_schedules table")
      } else {
        console.log("No message_schedules table found, skipping data migration")
      }
    } catch (error) {
      console.error("Error migrating existing schedule data:", error)
    }
    
    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

// Execute the migration
addSchedulingToTemplates().then(() => {
  console.log("Schema migration completed")
  process.exit(0)
}).catch(error => {
  console.error("Migration script failed with error:", error)
  process.exit(1)
}) 