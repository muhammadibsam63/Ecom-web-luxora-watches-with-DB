-- ==========================================
-- LUXORA WATCHES — v2 upgrade (idempotent)
-- Safe to run against a fresh DB (schema.sql already creates these) or an
-- existing v1 database (adds only what's missing). Run automatically by
-- `npm run migrate` after schema.sql.
-- ==========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_stock INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(6,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(60);
ALTER TABLE products ADD COLUMN IF NOT EXISTS movement_type VARCHAR(40);
ALTER TABLE products ADD COLUMN IF NOT EXISTS case_shape VARCHAR(40);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dial_finish VARCHAR(60);
ALTER TABLE products ADD COLUMN IF NOT EXISTS hands VARCHAR(60);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dial_indexes VARCHAR(60);
ALTER TABLE products ADD COLUMN IF NOT EXISTS strap_color VARCHAR(60);
ALTER TABLE products ADD COLUMN IF NOT EXISTS buckle_type VARCHAR(60);
ALTER TABLE products ADD COLUMN IF NOT EXISTS frequency VARCHAR(40);
ALTER TABLE products ADD COLUMN IF NOT EXISTS jewels INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(200);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description VARCHAR(300);
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(300);
ALTER TABLE products ADD COLUMN IF NOT EXISTS canonical_slug VARCHAR(220);
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_pre_order BOOLEAN NOT NULL DEFAULT FALSE;
-- add the status check constraint only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_status_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('active','draft','archived'));
  END IF;
END $$;

ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS saved_for_later BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount NUMERIC(10,2);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS per_user_limit INTEGER NOT NULL DEFAULT 1;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_status_check'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_status_check CHECK (status IN ('pending','approved','hidden'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS public_id VARCHAR(300);

-- Contact messages (Messages / inbox feature)
CREATE TABLE IF NOT EXISTS contact_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    subject         VARCHAR(200),
    message         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','archived')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- Password reset (forgot-password flow)
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
