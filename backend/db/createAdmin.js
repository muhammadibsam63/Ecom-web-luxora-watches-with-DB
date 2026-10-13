// Creates (or promotes) the admin account defined by ADMIN_EMAIL / ADMIN_PASSWORD in .env
// Run with: npm run create-admin
require('../config/loadEnv');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    console.error('✘ Set ADMIN_EMAIL in your .env file first.');
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error('✘ Set a strong ADMIN_PASSWORD (min 8 characters) in your .env file first.');
    console.error('  This value is only read once by this script — remove it from .env afterwards if you like.');
    process.exit(1);
  }

  try {
    const { rows } = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);
    const passwordHash = await bcrypt.hash(password, 12);

    if (rows[0]) {
      await pool.query(
        'UPDATE users SET role = $1, password_hash = $2, is_active = TRUE WHERE id = $3',
        ['admin', passwordHash, rows[0].id]
      );
      console.log(`✔ Existing account ${email} promoted to admin.`);
    } else {
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,'admin')`,
        ['Luxora Admin', email, passwordHash]
      );
      console.log(`✔ Admin account created: ${email}`);
    }
  } catch (err) {
    console.error('✘ Failed to create admin:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createAdmin();
