CREATE TABLE IF NOT EXISTS users_auth (
  id UUID PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  status VARCHAR(40) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_auth(id) ON UPDATE CASCADE ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_auth_email ON users_auth(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_username ON users_auth(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active ON refresh_tokens(user_id, expires_at) WHERE revoked_at IS NULL;

INSERT INTO users_auth (
  id,
  email,
  username,
  password_hash,
  role,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@greennest.local',
  'admin',
  'scrypt:greennest-admin-salt:c4Zn-KwSET-GfM32K2Aqwd-OxA7pq7IhqnCHDgfVVGvti-_SKjHVPNjWbv1HjQQjfHUOS7POPMX7fzGkA-NCzA',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;
