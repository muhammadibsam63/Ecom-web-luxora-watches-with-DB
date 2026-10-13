const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

// GET /api/admin/notifications
const listAdminNotifications = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM notifications WHERE recipient_type = 'admin' ORDER BY created_at DESC LIMIT 50`
  );
  const unreadCount = rows.filter((n) => !n.is_read).length;
  res.json({ success: true, notifications: rows, unreadCount });
});

// PATCH /api/admin/notifications/:id/read
const markAdminNotificationRead = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_type = 'admin' RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Notification not found.');
  res.json({ success: true, notification: rows[0] });
});

// PATCH /api/admin/notifications/read-all
const markAllAdminRead = asyncHandler(async (req, res) => {
  await query(`UPDATE notifications SET is_read = TRUE WHERE recipient_type = 'admin' AND is_read = FALSE`);
  res.json({ success: true });
});

module.exports = { listAdminNotifications, markAdminNotificationRead, markAllAdminRead };
