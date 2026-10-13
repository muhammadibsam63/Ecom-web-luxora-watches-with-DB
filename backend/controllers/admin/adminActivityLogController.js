const { query } = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

// GET /api/admin/activity-log
const listActivityLog = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const { rows: countRows } = await query('SELECT COUNT(*)::int AS total FROM admin_activity_log');
  const { rows } = await query(
    `SELECT l.*, u.full_name AS admin_name, u.email AS admin_email
     FROM admin_activity_log l LEFT JOIN users u ON u.id = l.admin_id
     ORDER BY l.created_at DESC LIMIT $1 OFFSET $2`,
    [limitNum, offset]
  );
  res.json({ success: true, activity: rows, pagination: { page: pageNum, limit: limitNum, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limitNum) } });
});

module.exports = { listActivityLog };
