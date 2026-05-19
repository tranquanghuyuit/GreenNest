CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  payment_code VARCHAR(40) NOT NULL UNIQUE,
  order_id UUID NOT NULL,
  order_code VARCHAR(32) NOT NULL,
  user_id UUID NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  method VARCHAR(40) NOT NULL CHECK (method IN ('cod', 'mock_card', 'bank_transfer', 'vnpay')),
  status VARCHAR(40) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  provider VARCHAR(40) NOT NULL DEFAULT 'internal',
  payment_url TEXT,
  provider_transaction_no VARCHAR(64),
  bank_code VARCHAR(32),
  bank_tran_no VARCHAR(255),
  card_type VARCHAR(32),
  pay_date VARCHAR(14),
  response_code VARCHAR(8),
  transaction_status VARCHAR(8),
  failure_reason TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_code ON payments(order_code);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_code ON payments(payment_code);
