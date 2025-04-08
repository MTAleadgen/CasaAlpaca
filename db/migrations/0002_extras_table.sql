-- Create extras table
CREATE TABLE IF NOT EXISTS extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on name
CREATE UNIQUE INDEX IF NOT EXISTS extras_name_idx ON extras (name);

-- Insert some default extras
INSERT INTO extras (name, description, type, price, duration, is_active) VALUES 
('Early Check-in', 'Arrive up to 2 hours earlier than the standard check-in time', 'early_checkin', 5000, 120, true),
('Late Check-out', 'Stay up to 2 hours later than the standard check-out time', 'late_checkout', 5000, 120, true),
('Welcome Basket', 'Receive a basket of local goodies upon arrival', 'addon', 7500, null, true)
ON CONFLICT (name) DO NOTHING; 