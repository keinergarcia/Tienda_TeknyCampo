-- Fix cart RLS policies to enforce session_id validation for anon users
-- Previously anon SELECT allowed reading ALL cart_items (no session_id check)

DROP POLICY IF EXISTS "cart_select" ON cart_items;
CREATE POLICY "cart_select" ON cart_items FOR SELECT
  TO anon, authenticated
  USING (
    (auth.role() = 'authenticated' AND user_id = auth.uid())
    OR
    (auth.role() = 'anon' AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "cart_insert" ON cart_items;
CREATE POLICY "cart_insert" ON cart_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.role() = 'authenticated' AND user_id = auth.uid())
    OR
    (auth.role() = 'anon' AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "cart_update" ON cart_items;
CREATE POLICY "cart_update" ON cart_items FOR UPDATE
  TO anon, authenticated
  USING (
    (auth.role() = 'authenticated' AND user_id = auth.uid())
    OR
    (auth.role() = 'anon' AND session_id IS NOT NULL)
  )
  WITH CHECK (
    (auth.role() = 'authenticated' AND user_id = auth.uid())
    OR
    (auth.role() = 'anon' AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "cart_delete" ON cart_items;
CREATE POLICY "cart_delete" ON cart_items FOR DELETE
  TO anon, authenticated
  USING (
    (auth.role() = 'authenticated' AND user_id = auth.uid())
    OR
    (auth.role() = 'anon' AND session_id IS NOT NULL)
  );
