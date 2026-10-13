const { query, withTransaction } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderNumber = require('../utils/orderNumber');
const { notifyAdmins } = require('../utils/notify');

const SHIPPING_FEE = 2500;
const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 150000;

async function validateCoupon(client, code, subtotal, userId) {
  if (!code) return null;
  const { rows } = await client.query(
    `SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE`,
    [code.toUpperCase()]
  );
  const coupon = rows[0];
  if (!coupon) throw ApiError.badRequest('That coupon code is not valid.');
  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    throw ApiError.badRequest('That coupon is not active yet.');
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw ApiError.badRequest('That coupon has expired.');
  }
  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    throw ApiError.badRequest('That coupon has reached its usage limit.');
  }
  if (Number(subtotal) < Number(coupon.min_order_amount)) {
    throw ApiError.badRequest(`This coupon requires a minimum order of $${coupon.min_order_amount}.`);
  }
  const { rows: usageRows } = await client.query(
    `SELECT COUNT(*)::int AS count FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2`,
    [coupon.id, userId]
  );
  if (usageRows[0].count >= (coupon.per_user_limit || 1)) {
    throw ApiError.badRequest('You have already used this coupon the maximum number of times.');
  }
  return coupon;
}

function calculateDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  let discount;
  if (coupon.discount_type === 'percentage') {
    discount = Number(((Number(subtotal) * Number(coupon.discount_value)) / 100).toFixed(2));
  } else {
    discount = Math.min(Number(coupon.discount_value), Number(subtotal));
  }
  if (coupon.max_discount !== null && coupon.max_discount !== undefined) {
    discount = Math.min(discount, Number(coupon.max_discount));
  }
  return discount;
}

// POST /api/orders  — checkout
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, contactEmail, contactPhone, paymentMethod, couponCode, notes } = req.body;

  if (!shippingAddress || !contactEmail || !contactPhone || !paymentMethod) {
    throw ApiError.badRequest('Missing required checkout information.');
  }
  if (!['cod', 'card'].includes(paymentMethod)) {
    throw ApiError.badRequest('Invalid payment method.');
  }

  const order = await withTransaction(async (client) => {
    const { rows: cartRows } = await client.query(
      `SELECT ci.id, ci.quantity, ci.custom_config, p.id AS product_id, p.name, p.price, p.stock,
              (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       FOR UPDATE OF p`,
      [req.user.id]
    );
    if (!cartRows.length) throw ApiError.badRequest('Your cart is empty.');

    for (const item of cartRows) {
      if (item.stock < item.quantity) {
        throw ApiError.badRequest(`"${item.name}" only has ${item.stock} in stock.`);
      }
    }

    const subtotal = cartRows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const coupon = await validateCoupon(client, couponCode, subtotal, req.user.id);
    const discount = calculateDiscount(coupon, subtotal);
    const tax = Number(((subtotal - discount) * TAX_RATE).toFixed(2));
    const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = Number((subtotal - discount + tax + shippingFee).toFixed(2));

    const orderNumber = generateOrderNumber();
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (order_number, user_id, status, subtotal, shipping_fee, tax, discount, total,
         coupon_id, payment_method, payment_status, shipping_address, contact_email, contact_phone, notes)
       VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        orderNumber, req.user.id, subtotal, shippingFee, tax, discount, total,
        coupon ? coupon.id : null, paymentMethod, paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
        JSON.stringify(shippingAddress), contactEmail, contactPhone, notes || null,
      ]
    );
    const newOrder = orderRows[0];

    for (const item of cartRows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, unit_price, quantity, custom_config)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [newOrder.id, item.product_id, item.name, item.image, item.price, item.quantity, item.custom_config]
      );
      await client.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.product_id]);
    }
    if (coupon) {
      await client.query(
        `INSERT INTO coupon_usage (coupon_id, user_id, order_id) VALUES ($1,$2,$3)`,
        [coupon.id, req.user.id, newOrder.id]
      );
      await client.query(`UPDATE coupons SET times_used = times_used + 1 WHERE id = $1`, [coupon.id]);
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    return newOrder;
  });

  notifyAdmins('new_order', `New order ${order.order_number}`, `Total $${Number(order.total).toLocaleString()}`, `/admin/orders`);

  const { rows: lowStockItems } = await query(
    `SELECT name, stock FROM products WHERE id = ANY(
       SELECT product_id FROM order_items WHERE order_id = $1
     ) AND stock <= low_stock_threshold AND stock > 0`,
    [order.id]
  );
  for (const item of lowStockItems) {
    notifyAdmins('low_stock', `${item.name} is low on stock`, `Only ${item.stock} remaining.`, `/admin/inventory`);
  }

  res.status(201).json({ success: true, order });
});

// GET /api/orders — current user's orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT o.*,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id)::int AS item_count
     FROM orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, orders: rows });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  const order = rows[0];
  if (!order) throw ApiError.notFound('Order not found.');

  const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
  res.json({ success: true, order, items });
});

module.exports = { createOrder, getMyOrders, getOrderById };
