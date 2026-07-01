-- Add structured address fields to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS neighborhood text DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '',
  ADD COLUMN IF NOT EXISTS department text DEFAULT '';
