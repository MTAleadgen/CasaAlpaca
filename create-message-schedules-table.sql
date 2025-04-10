-- Create trigger_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trigger_type') THEN
        CREATE TYPE trigger_type AS ENUM (
            'booking_created',
            'check_in',
            'check_out'
        );
    END IF;
END$$;

-- Create message_schedules table
CREATE TABLE IF NOT EXISTS message_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  template_id UUID NOT NULL,
  trigger_type trigger_type NOT NULL,
  days_offset INTEGER NOT NULL DEFAULT 0,
  hour INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_message_schedules_user_id ON message_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_message_schedules_template_id ON message_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_message_schedules_trigger_type ON message_schedules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_message_schedules_is_active ON message_schedules(is_active);

-- Set up trigger to automatically update the updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_message_schedules_timestamp') THEN
    CREATE TRIGGER update_message_schedules_timestamp
    BEFORE UPDATE ON message_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END $$; 