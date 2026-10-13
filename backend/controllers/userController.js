const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const sanitizeUser = require('../utils/sanitizeUser');
const { uploadBuffer } = require('../config/cloudinary');

// PATCH /api/users/me  { fullName, avatarUrl }
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, avatarUrl } = req.body;
  const { rows } = await query(
    `UPDATE users SET
        full_name = COALESCE($1, full_name),
        avatar_url = COALESCE($2, avatar_url)
     WHERE id = $3
     RETURNING id, full_name, email, avatar_url, role, is_active, created_at`,
    [fullName, avatarUrl, req.user.id]
  );
  res.json({ success: true, user: sanitizeUser(rows[0]) });
});

// POST /api/users/me/password  { currentPassword, newPassword }
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    throw ApiError.badRequest('New password must be at least 8 characters.');
  }

  const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const current = rows[0];

  if (current.password_hash) {
    const valid = await bcrypt.compare(currentPassword || '', current.password_hash);
    if (!valid) throw ApiError.unauthorized('Current password is incorrect.');
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);
  res.json({ success: true, message: 'Password updated.' });
});

// GET /api/users/me/addresses
const listAddresses = asyncHandler(async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
    [req.user.id]
  );
  res.json({ success: true, addresses: rows });
});

// POST /api/users/me/addresses
const createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;
  if (!fullName || !phone || !line1 || !city || !postalCode || !country) {
    throw ApiError.badRequest('Missing required address fields.');
  }

  if (isDefault) {
    await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
  }

  const { rows } = await query(
    `INSERT INTO addresses (user_id, full_name, phone, line1, line2, city, state, postal_code, country, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [req.user.id, fullName, phone, line1, line2 || null, city, state || null, postalCode, country, !!isDefault]
  );
  res.status(201).json({ success: true, address: rows[0] });
});

// DELETE /api/users/me/addresses/:id
const deleteAddress = asyncHandler(async (req, res) => {
  const { rows } = await query(
    'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  );
  if (!rows[0]) throw ApiError.notFound('Address not found.');
  res.json({ success: true });
});

// POST /api/users/me/avatar  (multipart, field "avatar")
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image was uploaded.');
  let uploaded;
  try {
    uploaded = await uploadBuffer(req.file.buffer, 'luxora-watches/avatars');
  } catch (err) {
    throw ApiError.badRequest(err.message);
  }
  const { rows } = await query(
    `UPDATE users SET avatar_url = $1 WHERE id = $2
     RETURNING id, full_name, email, avatar_url, role, is_active, created_at`,
    [uploaded.url, req.user.id]
  );
  res.json({ success: true, user: sanitizeUser(rows[0]) });
});

// DELETE /api/users/me/avatar
const removeAvatar = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `UPDATE users SET avatar_url = NULL WHERE id = $1
     RETURNING id, full_name, email, avatar_url, role, is_active, created_at`,
    [req.user.id]
  );
  res.json({ success: true, user: sanitizeUser(rows[0]) });
});

module.exports = { uploadAvatar, removeAvatar, updateProfile, changePassword, listAddresses, createAddress, deleteAddress };
