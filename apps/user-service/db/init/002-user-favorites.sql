CREATE TABLE IF NOT EXISTS user_favorites (
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_profile_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_profile ON user_favorites(user_profile_id);
