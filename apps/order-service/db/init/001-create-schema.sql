CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  order_code VARCHAR(32) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'shipping', 'completed', 'cancelled')),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_fee NUMERIC(12, 2) NOT NULL CHECK (shipping_fee >= 0),
  discount NUMERIC(12, 2) NOT NULL CHECK (discount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(40) NOT NULL CHECK (payment_method IN ('cod', 'mock_card', 'bank_transfer', 'vnpay')),
  shipping_address_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name_snapshot VARCHAR(255) NOT NULL,
  category_snapshot VARCHAR(120) NOT NULL,
  unit_price_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
