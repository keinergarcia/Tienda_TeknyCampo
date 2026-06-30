/*
# Tekny Campo E-commerce Database Schema

1. New Tables
- `categories` - Product categories (seeds, tools, fertilizers, etc.)
- `products` - Product catalog
- `cart_items` - Shopping cart (session-based for anon, user-based for auth)

2. Security
- Enable RLS on all tables
- Categories and products: public read
- Cart items: anon can CRUD (filtered by app query), auth restricted to own user_id
- Orders: auth users only, restricted to own user_id

3. Indexes
- Products: category_id, is_featured, is_offer
- Cart items: session_id, user_id
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_offer boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  CHECK (session_id IS NOT NULL OR user_id IS NOT NULL)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  subtotal decimal(10,2) NOT NULL,
  shipping decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text NOT NULL,
  city text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_price decimal(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_offer ON products(is_offer);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Products policies (public read)
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Cart items policies
-- Anon: can CRUD all cart_items (app-level filtering by session_id in WHERE clause)
-- Authenticated: restricted to own user_id

DROP POLICY IF EXISTS "cart_select" ON cart_items;
CREATE POLICY "cart_select" ON cart_items FOR SELECT
  TO anon, authenticated
  USING (
    (auth.role() = 'authenticated' AND user_id = auth.uid())
    OR
    (auth.role() = 'anon')
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

-- Orders policies (authenticated users only)
DROP POLICY IF EXISTS "order_select" ON orders;
CREATE POLICY "order_select" ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "order_insert" ON orders;
CREATE POLICY "order_insert" ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "order_update" ON orders;
CREATE POLICY "order_update" ON orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Order items policies (authenticated users only, via order relationship)
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );
