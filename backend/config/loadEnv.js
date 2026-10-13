// Loads backend/.env by an absolute path instead of relying on dotenv's
// default (which resolves ".env" against the process's current working
// directory). That default breaks silently whenever the app is started
// from a different folder than backend/ — a common cause of env vars
// like CLOUDINARY_* appearing "unset" even though the file has values.
//
// Every entry point (server.js, db/migrate.js, db/seed.js, db/createAdmin.js)
// requires this file FIRST, before anything that reads process.env.
const path = require('path');
const dotenv = require('dotenv');

const result = dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

if (result.error && process.env.NODE_ENV !== 'production') {
  // Not fatal — the process may still work if real environment variables
  // (not a .env file) are set, e.g. in a hosting platform's dashboard.
  console.warn(
    `⚠ Could not read ${path.resolve(__dirname, '..', '.env')} (${result.error.code || result.error.message}). ` +
    `If you're running locally, copy backend/.env.example to backend/.env and fill it in.`
  );
}

module.exports = result;
