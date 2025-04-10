import { sql } from "drizzle-orm"
import { pgEnum } from "drizzle-orm/pg-core"

// Create the template_type enum
export const templateTypeEnum = pgEnum("template_type", [
  "welcome",
  "appointment_reminder",
  "appointment_confirmation",
  "payment_confirmation",
  "follow_up",
  "booking_confirmation",
  "check_in_instructions",
  "custom"
])

export async function up(db: any) {
  // Create the messages table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" TEXT NOT NULL,
      "admin_id" TEXT,
      "phone_number" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "direction" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'sent',
      "message_id" TEXT,
      "media_url" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    );
  `)

  // Create the message_templates table
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE template_type AS ENUM (
        'welcome',
        'appointment_reminder',
        'appointment_confirmation',
        'payment_confirmation',
        'follow_up',
        'booking_confirmation',
        'check_in_instructions',
        'custom'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "message_templates" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "type" template_type NOT NULL,
      "description" TEXT,
      "variables" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    );
  `)

  console.log("Created messages and message_templates tables")
}

export async function down(db: any) {
  await db.execute(sql`DROP TABLE IF EXISTS "messages";`)
  await db.execute(sql`DROP TABLE IF EXISTS "message_templates";`)
  await db.execute(sql`DROP TYPE IF EXISTS "template_type";`)
  console.log(
    "Dropped messages and message_templates tables and template_type enum"
  )
}
