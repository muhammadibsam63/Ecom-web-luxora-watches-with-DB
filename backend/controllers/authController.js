const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, setAuthCookie, clearAuthCookie } = require('../utils/token');
const sanitizeUser = require('../utils/sanitizeUser');
const { notifyAdmins } = require('../utils/notify');
const crypto = require('crypto');
const { sendMail } = require('../utils/email');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const SALT_ROUNDS = 12;

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) throw ApiError.conflict('An account with that email already exists.');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'customer')
     RETURNING id, full_name, email, avatar_url, role, is_active, created_at`,
    [fullName, email, passwordHash]
  );

  const user = rows[0];
  const token = generateToken(user.id, user.role);
  setAuthCookie(res, token);

  notifyAdmins('new_customer', 'New customer registered', `${user.full_name} (${user.email})`, `/admin/users`);

  res.status(201).json({ success: true, user: sanitizeUser(user), token });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user || !user.password_hash) {
    throw ApiError.unauthorized('Invalid email or password.');
  }
  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated.');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password.');

  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const token = generateToken(user.id, user.role);
  setAuthCookie(res, token);

  res.json({ success: true, user: sanitizeUser(user), token });
});

// POST /api/auth/google
// Body: { credential } — the ID token from Google Identity Services on the frontend
const googleAuth = asyncHandler(async (req, res) => {
  if (!googleClient) {
    throw ApiError.internal(
      'Google sign-in is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
    );
  }
  const { credential } = req.body;
  if (!credential) throw ApiError.badRequest('Missing Google credential.');

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let { rows } = await query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
  let user = rows[0];

  if (!user) {
    const inserted = await query(
      `INSERT INTO users (full_name, email, google_id, avatar_url, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING *`,
      [name, email, googleId, picture]
    );
    user = inserted.rows[0];
  } else if (!user.google_id) {
    // Link existing email/password account with Google
    const updated = await query(
      `UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3 RETURNING *`,
      [googleId, picture, user.id]
    );
    user = updated.rows[0];
  }

  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated.');

  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const token = generateToken(user.id, user.role);
  setAuthCookie(res, token);

  res.json({ success: true, user: sanitizeUser(user), token });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Signed out.' });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});


// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('Email is required.');

  const { rows } = await query('SELECT id, full_name, password_hash FROM users WHERE email = $1', [email]);
  const user = rows[0];

  // Always respond the same way whether or not the account exists, so the
  // endpoint can't be used to discover which emails have accounts.
  const genericResponse = { success: true, message: 'If an account exists for that email, a reset link has been sent.' };

  if (!user || !user.password_hash) {
    // No account, or a Google-only account with no password to reset.
    return res.json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await query('UPDATE users SET reset_token_hash = $1, reset_token_expires = $2 WHERE id = $3', [tokenHash, expires, user.id]);

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;
  await sendMail({
    to: email,
    subject: 'Reset your Luxora Watches password',
    html: `<p>Hello ${user.full_name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
  });

  res.json(genericResponse);
});

// POST /api/auth/reset-password  { token, newPassword }
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) throw ApiError.badRequest('token and newPassword are required.');
  if (newPassword.length < 8) throw ApiError.badRequest('Password must be at least 8 characters.');

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const { rows } = await query(
    `SELECT id FROM users WHERE reset_token_hash = $1 AND reset_token_expires > NOW()`,
    [tokenHash]
  );
  const user = rows[0];
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired. Please request a new one.');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await query(
    'UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = $2',
    [passwordHash, user.id]
  );

  res.json({ success: true, message: 'Your password has been reset. You can now sign in.' });
});

module.exports = { signup, login, googleAuth, logout, me, forgotPassword, resetPassword };
