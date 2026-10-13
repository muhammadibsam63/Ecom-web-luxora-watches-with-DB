-- ==========================================
-- LUXORA WATCHES — PostgreSQL Schema
-- Run with: npm run migrate
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------
-- USERS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),               -- NULL for Google-only accounts
    google_id       VARCHAR(255) UNIQUE,
    avatar_url      TEXT,
    role            VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    reset_token_hash VARCHAR(128),
    reset_token_expires TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------
-- CATEGORIES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    description     TEXT,
    image_url       TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- COLLECTIONS (curated groupings, distinct from categories)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL UNIQUE,
    slug            VARCHAR(140) NOT NULL UNIQUE,
    description     TEXT,
    hero_image      TEXT,
    banner_image    TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- PRODUCTS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(220) NOT NULL UNIQUE,
    brand               VARCHAR(100) NOT NULL DEFAULT 'Luxora',
    description         TEXT NOT NULL,
    short_description   VARCHAR(300),
    price               NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    compare_price        NUMERIC(10,2) CHECK (compare_price >= 0),
    cost_price           NUMERIC(10,2) CHECK (cost_price >= 0),
    category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    collection_id        INTEGER REFERENCES collections(id) ON DELETE SET NULL,
    stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reserved_stock       INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    low_stock_threshold  INTEGER NOT NULL DEFAULT 5,
    weight               NUMERIC(6,2),
    sku                 VARCHAR(60) NOT NULL UNIQUE,
    barcode              VARCHAR(60),
    movement            VARCHAR(80),
    movement_type        VARCHAR(40),
    case_material       VARCHAR(80),
    case_diameter       VARCHAR(40),
    case_thickness      VARCHAR(40),
    case_shape           VARCHAR(40),
    water_resistance    VARCHAR(60),
    crystal             VARCHAR(80),
    dial_color          VARCHAR(60),
    dial_finish          VARCHAR(60),
    hands                VARCHAR(60),
    dial_indexes         VARCHAR(60),
    strap_material      VARCHAR(80),
    strap_color          VARCHAR(60),
    buckle_type           VARCHAR(60),
    power_reserve       VARCHAR(60),
    frequency            VARCHAR(40),
    jewels               INTEGER,
    warranty            VARCHAR(80),
    meta_title            VARCHAR(200),
    meta_description      VARCHAR(300),
    seo_keywords          VARCHAR(300),
    canonical_slug        VARCHAR(220),
    rating_average       NUMERIC(2,1) NOT NULL DEFAULT 0,
    rating_count         INTEGER NOT NULL DEFAULT 0,
    status               VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival      BOOLEAN NOT NULL DEFAULT FALSE,
    is_best_seller      BOOLEAN NOT NULL DEFAULT FALSE,
    is_limited_edition   BOOLEAN NOT NULL DEFAULT FALSE,
    is_pre_order         BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ------------------------------------------
-- PRODUCT IMAGES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
    id              SERIAL PRIMARY KEY,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    public_id       VARCHAR(300),                -- Cloudinary public ID, for clean deletion
    alt_text        VARCHAR(200),
    image_type      VARCHAR(30) NOT NULL DEFAULT 'gallery' CHECK (image_type IN ('front','angled','side','lifestyle','detail','gallery')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ------------------------------------------
-- ADDRESSES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(30) NOT NULL,
    line1           VARCHAR(200) NOT NULL,
    line2           VARCHAR(200),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100),
    postal_code     VARCHAR(20) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ------------------------------------------
-- CART ITEMS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    custom_config   JSONB,                      -- for Build Your Watch items
    saved_for_later BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id, custom_config)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- ------------------------------------------
-- WISHLIST ITEMS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_id);

-- ------------------------------------------
-- COUPONS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(40) NOT NULL UNIQUE,
    discount_type       VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage','fixed')),
    discount_value      NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount        NUMERIC(10,2) CHECK (max_discount >= 0),
    usage_limit         INTEGER,
    per_user_limit       INTEGER NOT NULL DEFAULT 1,
    times_used          INTEGER NOT NULL DEFAULT 0,
    starts_at            TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_usage (
    id              SERIAL PRIMARY KEY,
    coupon_id       INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        UUID,
    used_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (coupon_id, user_id, order_id)
);

-- ------------------------------------------
-- ORDERS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(30) NOT NULL UNIQUE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled')),
    subtotal            NUMERIC(10,2) NOT NULL,
    shipping_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax                 NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount            NUMERIC(10,2) NOT NULL DEFAULT 0,
    total                NUMERIC(10,2) NOT NULL,
    coupon_id           INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
    payment_method       VARCHAR(30) NOT NULL CHECK (payment_method IN ('cod','card')),
    payment_status       VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
    shipping_address    JSONB NOT NULL,
    contact_email        VARCHAR(255) NOT NULL,
    contact_phone        VARCHAR(30) NOT NULL,
    notes                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name    VARCHAR(200) NOT NULL,      -- snapshot at purchase time
    product_image   TEXT,
    unit_price      NUMERIC(10,2) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    custom_config   JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ------------------------------------------
-- REVIEWS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id            UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating              INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment             TEXT,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    status               VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','hidden')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id)  -- prevents duplicate reviews per product per user
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- ------------------------------------------
-- JOURNAL ARTICLES (CMS)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS journal_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    excerpt         VARCHAR(400),
    content         TEXT NOT NULL,
    cover_image     TEXT,
    author          VARCHAR(120) NOT NULL DEFAULT 'Luxora Editorial',
    category        VARCHAR(80),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_status ON journal_articles(status);
CREATE INDEX IF NOT EXISTS idx_journal_slug ON journal_articles(slug);

-- ------------------------------------------
-- TESTIMONIALS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
    id              SERIAL PRIMARY KEY,
    customer_name   VARCHAR(150) NOT NULL,
    role_location   VARCHAR(150),
    text            TEXT NOT NULL,
    rating          INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    avatar_url      TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden')),
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);

-- ------------------------------------------
-- NOTIFICATIONS (admin + customer, one table)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type  VARCHAR(20) NOT NULL CHECK (recipient_type IN ('admin','user')),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,  -- NULL + recipient_type='admin' = broadcast to all admins
    type            VARCHAR(60) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    body            VARCHAR(400),
    link            VARCHAR(300),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, is_read);

-- ------------------------------------------
-- ADMIN ACTIVITY LOG
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,       -- e.g. 'product.created', 'order.status_changed'
    entity_type     VARCHAR(60) NOT NULL,        -- e.g. 'product', 'order', 'coupon'
    entity_id       VARCHAR(80),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_log_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON admin_activity_log(created_at DESC);

-- ------------------------------------------
-- HOMEPAGE SECTIONS (lightweight CMS)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS homepage_sections (
    id              SERIAL PRIMARY KEY,
    section_key     VARCHAR(60) NOT NULL UNIQUE, -- 'hero','featured_collection','craftsmanship', etc.
    title           VARCHAR(200),
    subtitle        VARCHAR(300),
    image_url       TEXT,
    cta_label       VARCHAR(80),
    cta_link        VARCHAR(300),
    content         JSONB,                       -- flexible extra fields per section type
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- RECENTLY VIEWED
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recently_viewed (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id, viewed_at DESC);

-- ------------------------------------------
-- STORE SETTINGS (key/value, database-backed)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key             VARCHAR(80) PRIMARY KEY,     -- 'store','shipping','tax','order','email','security','theme'
    value           JSONB NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- updated_at trigger helper
-- ------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_collections_updated_at ON collections;
CREATE TRIGGER trg_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_journal_updated_at ON journal_articles;
CREATE TRIGGER trg_journal_updated_at BEFORE UPDATE ON journal_articles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
