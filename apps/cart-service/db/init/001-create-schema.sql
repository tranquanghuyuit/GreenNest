CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'checked_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_one_active_per_user
  ON carts(user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
