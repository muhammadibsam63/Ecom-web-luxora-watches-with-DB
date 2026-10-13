const { verifyToken, COOKIE_NAME } = require('../utils/token');
const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function extractToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

// Requires a valid, logged-in, active user. Attaches req.user.
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('You must be signed in to do that.');

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }

  const { rows } = await query(
    `SELECT id, full_name, email, avatar_url, role, is_active, created_at
     FROM users WHERE id = $1`,
    [payload.sub]
  );
  const user = rows[0];
  if (!user) throw ApiError.unauthorized('Account not found.');
  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated.');

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but does not require one.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const { rows } = await query(
      `SELECT id, full_name, email, avatar_url, role, is_active, created_at
       FROM users WHERE id = $1`,
      [payload.sub]
    );
    if (rows[0] && rows[0].is_active) req.user = rows[0];
  } catch (err) {
    // invalid/expired token — proceed unauthenticated
  }
  next();
});

module.exports = { requireAuth, optionalAuth };
