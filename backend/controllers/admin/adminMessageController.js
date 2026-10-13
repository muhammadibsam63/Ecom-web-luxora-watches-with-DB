const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');

// GET /api/admin/messages
const listMessages = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = [];
  const params = [];
  let i = 1;
  if (status) { where.push(`status = $${i}`); params.push(status); i++; }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM contact_messages ${whereClause}`, params);
  const { rows } = await query(
    `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limitNum, offset]
  );
  res.json({ success: true, messages: rows, pagination: { page: pageNum, limit: limitNum, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limitNum) } });
});

// PATCH /api/admin/messages/:id/status  { status: 'read'|'unread'|'archived' }
const setMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['unread', 'read', 'archived'].includes(status)) throw ApiError.badRequest('Invalid status.');
  const { rows } = await query('UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Message not found.');
  res.json({ success: true, message: rows[0] });
});

// DELETE /api/admin/messages/:id
const deleteMessage = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Message not found.');
  await logActivity(req.user.id, 'message.deleted', 'contact_message', req.params.id);
  res.json({ success: true, message: 'Message deleted.' });
});

module.exports = { listMessages, setMessageStatus, deleteMessage };
