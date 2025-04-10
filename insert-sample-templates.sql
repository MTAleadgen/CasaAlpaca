-- Insert sample message templates
-- Replace 'user_id' with your actual admin user ID (from ADMIN_USER_ID env variable)

-- Welcome template
INSERT INTO message_templates (user_id, name, content, type, description, variables)
VALUES (
  'user_2vPCQyG2fQO8HTyjA4',
  'Welcome Message',
  'Hello {{name}}, welcome to Casa Alpaca! We're excited for your upcoming stay. If you have any questions before your arrival, please don't hesitate to ask.',
  'welcome',
  'Initial welcome message sent after booking confirmation',
  '["name"]'
);

-- Booking confirmation
INSERT INTO message_templates (user_id, name, content, type, description, variables)
VALUES (
  'user_2vPCQyG2fQO8HTyjA4',
  'Booking Confirmation',
  'Your booking at Casa Alpaca has been confirmed for {{checkInDate}} to {{checkOutDate}}. Your booking reference is {{reference}}. We look forward to welcoming you!',
  'booking_confirmation',
  'Sent when a booking is confirmed',
  '["checkInDate", "checkOutDate", "reference"]'
);

-- Check-in instructions
INSERT INTO message_templates (user_id, name, content, type, description, variables)
VALUES (
  'user_2vPCQyG2fQO8HTyjA4',
  'Check-in Instructions',
  'Your check-in at Casa Alpaca is tomorrow! Here's what you need to know:\n\nAddress: {{address}}\nCheck-in time: {{checkInTime}}\nGate code: {{gateCode}}\n\nPlease message us when you're on your way so we can ensure everything is ready for your arrival.',
  'check_in_instructions',
  'Sent the day before check-in with all necessary information',
  '["address", "checkInTime", "gateCode"]'
);

-- Appointment reminder
INSERT INTO message_templates (user_id, name, content, type, description, variables)
VALUES (
  'user_2vPCQyG2fQO8HTyjA4',
  'Appointment Reminder',
  'This is a reminder that you have an appointment scheduled for {{date}} at {{time}}. Please let us know if you need to reschedule.',
  'appointment_reminder',
  'Sent before a scheduled appointment',
  '["date", "time"]'
);

-- Follow-up message
INSERT INTO message_templates (user_id, name, content, type, description, variables)
VALUES (
  'user_2vPCQyG2fQO8HTyjA4',
  'Stay Follow-up',
  'Hello {{name}}, thank you for staying at Casa Alpaca! We hope you enjoyed your time with us. We'd love to hear your feedback and hope to welcome you back in the future.',
  'follow_up',
  'Sent after guest checkout to gather feedback',
  '["name"]'
); 