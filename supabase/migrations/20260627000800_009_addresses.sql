-- User addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  neighborhood text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  department text NOT NULL,
  notes text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_select" ON addresses;
CREATE POLICY "addresses_select" ON addresses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "addresses_insert" ON addresses;
CREATE POLICY "addresses_insert" ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "addresses_update" ON addresses;
CREATE POLICY "addresses_update" ON addresses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "addresses_delete" ON addresses;
CREATE POLICY "addresses_delete" ON addresses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
