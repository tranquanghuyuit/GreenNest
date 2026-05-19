CREATE TABLE IF NOT EXISTS product_deals (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  product_ids TEXT[] NOT NULL,
  discount_percent SMALLINT NOT NULL CHECK (discount_percent BETWEEN 1 AND 90),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_deals_status ON product_deals(status);
