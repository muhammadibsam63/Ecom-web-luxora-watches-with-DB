const { Pool } = require('pg');
require('./loadEnv');

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set. Copy .env.example to .env and configure it.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
  process.exit(1);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (process.env.NODE_ENV !== 'production') {
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Run a set of queries inside a single transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} callback
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
