-- Create template_type enum if it doesn't exist
CREATE TYPE IF NOT EXISTS template_type AS ENUM (
  'welcome',
  'appointment_reminder',
  'appointment_confirmation',
  'payment_confirmation',
  'follow_up',
  'booking_confirmation',
  'check_in_instructions',
  'custom'
);

-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type template_type NOT NULL,
  description TEXT,
  variables TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  admin_id TEXT,
  phone_number TEXT NOT NULL,
  content TEXT NOT NULL,
  direction TEXT NOT NULL, -- "inbound" or "outbound"
  status TEXT NOT NULL DEFAULT 'sent', -- "sent", "delivered", "read", "failed"
  message_id TEXT, -- WhatsApp message ID for tracking
  media_url TEXT, -- URL of any media attached to the message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_phone_number ON messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message_templates
DROP TRIGGER IF EXISTS update_message_templates_timestamp ON message_templates;
CREATE TRIGGER update_message_templates_timestamp
BEFORE UPDATE ON message_templates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger for messages
DROP TRIGGER IF EXISTS update_messages_timestamp ON messages;
CREATE TRIGGER update_messages_timestamp
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_timestamp(); 