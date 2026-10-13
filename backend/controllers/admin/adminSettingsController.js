const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');

const ALLOWED_KEYS = ['store', 'shipping', 'tax', 'order', 'email', 'security', 'theme'];

// GET /api/admin/settings — all settings groups as one object
const getSettings = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT key, value FROM settings');
  const settings = {};
  ALLOWED_KEYS.forEach((k) => { settings[k] = {}; });
  rows.forEach((r) => { settings[r.key] = r.value; });
  res.json({ success: true, settings });
});

// PATCH /api/admin/settings/:key  { value: {...} }
const updateSettings = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (!ALLOWED_KEYS.includes(key)) throw ApiError.badRequest(`Unknown settings key. Must be one of: ${ALLOWED_KEYS.join(', ')}`);
  if (typeof value !== 'object' || value === null) throw ApiError.badRequest('value must be an object.');

  const { rows } = await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
     RETURNING *`,
    [key, JSON.stringify(value)]
  );
  await logActivity(req.user.id, 'settings.updated', 'settings', key, { key });
  res.json({ success: true, setting: rows[0] });
});

module.exports = { getSettings, updateSettings };
