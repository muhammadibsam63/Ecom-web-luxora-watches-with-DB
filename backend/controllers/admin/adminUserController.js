const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const sanitizeUser = require('../../utils/sanitizeUser');
const { logActivity } = require('../../utils/activityLog');

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const where = [];
  const params = [];
  let i = 1;
  if (search) {
    where.push(`(full_name ILIKE $${i} OR email ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM users ${whereClause}`, params);
  const { rows } = await query(
    `SELECT u.id, u.full_name, u.email, u.role, u.is_active, u.created_at, u.avatar_url,
            (SELECT COUNT(*) FROM orders WHERE user_id = u.id)::int AS order_count
     FROM users u ${whereClause} ORDER BY u.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limitNum, offset]
  );

  res.json({
    success: true, users: rows,
    pagination: { page: pageNum, limit: limitNum, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limitNum) },
  });
});

// GET /api/admin/users/:id
const getUser = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('User not found.');
  const { rows: orders } = await query(
    'SELECT id, order_number, status, total, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json({ success: true, user: sanitizeUser(rows[0]), orders });
});

// PATCH /api/admin/users/:id/role  { role }
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'admin'].includes(role)) throw ApiError.badRequest('Invalid role.');
  if (req.params.id === req.user.id) throw ApiError.badRequest('You cannot change your own role.');

  const { rows } = await query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [role, req.params.id]);
  if (!rows[0]) throw ApiError.notFound('User not found.');
  await logActivity(req.user.id, 'user.role_changed', 'user', req.params.id, { role });
  res.json({ success: true, user: sanitizeUser(rows[0]) });
});

// PATCH /api/admin/users/:id/status  { isActive }
const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (req.params.id === req.user.id) throw ApiError.badRequest('You cannot deactivate your own account.');

  const { rows } = await query('UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *', [!!isActive, req.params.id]);
  if (!rows[0]) throw ApiError.notFound('User not found.');
  await logActivity(req.user.id, isActive ? 'user.reactivated' : 'user.deactivated', 'user', req.params.id);
  res.json({ success: true, user: sanitizeUser(rows[0]) });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw ApiError.badRequest('You cannot delete your own account.');
  const { rows: orderRows } = await query('SELECT id FROM orders WHERE user_id = $1 LIMIT 1', [req.params.id]);
  if (orderRows.length) {
    throw ApiError.badRequest('This user has order history and cannot be deleted. Deactivate the account instead.');
  }
  const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('User not found.');
  res.json({ success: true, message: 'User deleted.' });
});

module.exports = { listUsers, getUser, changeUserRole, setUserActive, deleteUser };
