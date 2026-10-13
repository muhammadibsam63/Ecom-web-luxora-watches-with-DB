require('../config/loadEnv');
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

// Every table the application code depends on at runtime. Kept as an
// explicit list (rather than relying on schema.sql "looking right") so a
// partial/failed migration is caught immediately instead of surfacing later
// as a confusing "relation ... does not exist" 500 from some unrelated route.
const EXPECTED_TABLES = [
  'users', 'categories', 'collections', 'products', 'product_images', 'addresses',
  'cart_items', 'wishlist_items', 'coupons', 'coupon_usage', 'orders', 'order_items',
  'reviews', 'journal_articles', 'testimonials', 'notifications', 'admin_activity_log',
  'homepage_sections', 'recently_viewed', 'settings', 'contact_messages',
];

async function verifyTables() {
  const { rows } = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  );
  const present = new Set(rows.map((r) => r.table_name));
  const missing = EXPECTED_TABLES.filter((t) => !present.has(t));
  return { present, missing };
}

async function migrate() {
  console.log('Running schema migration...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('✔ Base schema in place (tables, indexes, triggers).');

    const upgradeSql = fs.readFileSync(path.join(__dirname, 'schema_v2_upgrade.sql'), 'utf8');
    await pool.query(upgradeSql);
    console.log('✔ v2 upgrade applied (new columns for admin panel, CMS, inventory).');

    const { missing } = await verifyTables();
    if (missing.length) {
      console.error(`✘ Migration ran without error, but these expected tables are still missing: ${missing.join(', ')}`);
      console.error('  This usually means an earlier statement in schema.sql/schema_v2_upgrade.sql was skipped or');
      console.error('  the migration ran against a different database than the app connects to at runtime.');
      console.error('  Double-check DATABASE_URL in backend/.env matches the database you expect, then re-run: npm run migrate');
      process.exitCode = 1;
      return;
    }

    console.log(`✔ Verified all ${EXPECTED_TABLES.length} expected tables exist.`);
    console.log('✔ Migration complete.');
  } catch (err) {
    console.error('✘ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
