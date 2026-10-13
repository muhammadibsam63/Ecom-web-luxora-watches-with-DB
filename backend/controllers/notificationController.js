const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications — current user's own notifications (recipient_type='user')
const listMyNotifications = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM notifications WHERE recipient_type = 'user' AND user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  );
  const unreadCount = rows.filter((n) => !n.is_read).length;
  res.json({ success: true, notifications: rows, unreadCount });
});

// PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_type = 'user' AND user_id = $2 RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) throw ApiError.notFound('Notification not found.');
  res.json({ success: true, notification: rows[0] });
});

// PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await query(`UPDATE notifications SET is_read = TRUE WHERE recipient_type = 'user' AND user_id = $1 AND is_read = FALSE`, [req.user.id]);
  res.json({ success: true });
});

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `DELETE FROM notifications WHERE id = $1 AND recipient_type = 'user' AND user_id = $2 RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) throw ApiError.notFound('Notification not found.');
  res.json({ success: true });
});

module.exports = { listMyNotifications, markRead, markAllRead, deleteNotification };
