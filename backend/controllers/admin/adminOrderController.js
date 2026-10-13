const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');
const { notifyUser } = require('../../utils/notify');

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

// GET /api/admin/orders
const listOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const where = [];
  const params = [];
  let i = 1;

  if (status) { where.push(`o.status = $${i}`); params.push(status); i++; }
  if (search) {
    where.push(`(o.order_number ILIKE $${i} OR u.email ILIKE $${i} OR u.full_name ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM orders o JOIN users u ON u.id = o.user_id ${whereClause}`, params
  );
  const { rows } = await query(
    `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id)::int AS item_count
     FROM orders o JOIN users u ON u.id = o.user_id
     ${whereClause} ORDER BY o.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limitNum, offset]
  );

  res.json({
    success: true, orders: rows,
    pagination: { page: pageNum, limit: limitNum, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limitNum) },
  });
});

// GET /api/admin/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
    [req.params.id]
  );
  const order = rows[0];
  if (!order) throw ApiError.notFound('Order not found.');
  const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  res.json({ success: true, order, items });
});

// PATCH /api/admin/orders/:id/status  { status }
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) throw ApiError.badRequest('Invalid order status.');

  const { rows } = await query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Order not found.');

  if (status === 'delivered') {
    await query(`UPDATE orders SET payment_status = 'paid' WHERE id = $1 AND payment_method = 'cod'`, [req.params.id]);
  }

  await logActivity(req.user.id, 'order.status_changed', 'order', req.params.id, { status });

  const STATUS_MESSAGES = {
    confirmed: 'Your order has been confirmed.',
    shipped: 'Your order is on its way.',
    out_for_delivery: 'Your order is out for delivery.',
    delivered: 'Your order has been delivered.',
    cancelled: 'Your order was cancelled.',
  };
  if (STATUS_MESSAGES[status]) {
    notifyUser(rows[0].user_id, 'order_update', `Order ${rows[0].order_number}`, STATUS_MESSAGES[status], `/account/orders/${rows[0].id}`);
  }

  res.json({ success: true, order: rows[0] });
});

module.exports = { listOrders, getOrder, updateOrderStatus };
