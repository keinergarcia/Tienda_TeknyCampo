-- Add unique alphanumeric order number
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number text UNIQUE;

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS trigger AS $$
DECLARE
  year text;
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i int;
BEGIN
  year := to_char(NOW(), 'YYYY');
  FOR i IN 1..4 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  NEW.order_number := 'ORD-' || year || '-' || code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_order_number ON orders;
CREATE TRIGGER trg_orders_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Create stock deduction function
CREATE OR REPLACE FUNCTION deduct_stock_on_order()
RETURNS trigger AS $$
BEGIN
  UPDATE products SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id AND stock >= NEW.quantity;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_items_deduct_stock ON order_items;
CREATE TRIGGER trg_order_items_deduct_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_order();

-- Re-stock on cancellation
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    UPDATE products p SET stock = stock + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_restore_stock ON orders;
CREATE TRIGGER trg_orders_restore_stock
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cancel();
