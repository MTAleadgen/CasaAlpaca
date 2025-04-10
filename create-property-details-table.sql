-- Create property_details table
CREATE TABLE IF NOT EXISTS property_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  address TEXT,
  house_rules TEXT,
  wifi_name TEXT,
  wifi_password TEXT,
  listing_name TEXT,
  check_in_instructions TEXT,
  check_out_instructions TEXT,
  emergency_contact TEXT,
  local_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_property_details_user_id ON property_details(user_id);
CREATE INDEX IF NOT EXISTS idx_property_details_property_id ON property_details(property_id);

-- Set up trigger to automatically update the updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_property_details_timestamp') THEN
    CREATE TRIGGER update_property_details_timestamp
    BEFORE UPDATE ON property_details
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END $$; 