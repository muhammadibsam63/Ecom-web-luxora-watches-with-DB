const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const sanitizeUser = require('../../utils/sanitizeUser');
const { uploadBuffer } = require('../../config/cloudinary');

// GET /api/admin/profile
const getAdminProfile = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  res.json({ success: true, admin: sanitizeUser(rows[0]) });
});

// PATCH /api/admin/profile  { fullName, email, avatarUrl }
const updateAdminProfile = asyncHandler(async (req, res) => {
  const { fullName, email, avatarUrl } = req.body;

  if (email) {
    const { rows: existing } = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
    if (existing.length) throw ApiError.conflict('That email is already in use.');
  }

  const { rows } = await query(
    `UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), avatar_url = COALESCE($3, avatar_url)
     WHERE id = $4 RETURNING *`,
    [fullName, email, avatarUrl, req.user.id]
  );
  res.json({ success: true, admin: sanitizeUser(rows[0]) });
});

// DELETE /api/admin/profile/avatar
const removeAdminAvatar = asyncHandler(async (req, res) => {
  const { rows } = await query(`UPDATE users SET avatar_url = NULL WHERE id = $1 RETURNING *`, [req.user.id]);
  res.json({ success: true, admin: sanitizeUser(rows[0]) });
});

// POST /api/admin/profile/password
const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) throw ApiError.badRequest('New password must be at least 8 characters.');

  const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (rows[0].password_hash) {
    const valid = await bcrypt.compare(currentPassword || '', rows[0].password_hash);
    if (!valid) throw ApiError.unauthorized('Current password is incorrect.');
  }
  const hash = await bcrypt.hash(newPassword, 12);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
  res.json({ success: true, message: 'Password updated.' });
});

// POST /api/admin/profile/avatar  (multipart, field "avatar")
const uploadAdminAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image was uploaded.');
  let uploaded;
  try {
    uploaded = await uploadBuffer(req.file.buffer, 'luxora-watches/avatars');
  } catch (err) {
    throw ApiError.badRequest(err.message);
  }
  const { rows } = await query('UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *', [uploaded.url, req.user.id]);
  res.json({ success: true, admin: sanitizeUser(rows[0]) });
});

module.exports = { uploadAdminAvatar, getAdminProfile, updateAdminProfile, removeAdminAvatar, changeAdminPassword };
