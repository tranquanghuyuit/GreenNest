CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  birthday DATE,
  gender VARCHAR(20) NOT NULL DEFAULT '',
  avatar_url TEXT,
  loyalty_point INTEGER NOT NULL DEFAULT 0,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY,
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
  label VARCHAR(80) NOT NULL,
  receiver_name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  line1 TEXT NOT NULL,
  ward VARCHAR(120) NOT NULL DEFAULT '',
  district VARCHAR(120) NOT NULL DEFAULT '',
  city VARCHAR(120) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_profile_id ON user_addresses(user_profile_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_addresses_one_default
  ON user_addresses(user_profile_id)
  WHERE is_default = TRUE;
