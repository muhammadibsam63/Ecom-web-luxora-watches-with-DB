const { query } = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

// GET /api/admin/search?q=...
const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, results: { products: [], orders: [], customers: [], categories: [], coupons: [] } });

  const like = `%${q}%`;

  const [products, orders, customers, categories, coupons] = await Promise.all([
    query(`SELECT id, name, slug, sku FROM products WHERE name ILIKE $1 OR sku ILIKE $1 LIMIT 5`, [like]),
    query(`SELECT o.id, o.order_number, u.full_name AS customer_name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.order_number ILIKE $1 LIMIT 5`, [like]),
    query(`SELECT id, full_name, email FROM users WHERE role = 'customer' AND (full_name ILIKE $1 OR email ILIKE $1) LIMIT 5`, [like]),
    query(`SELECT id, name, slug FROM categories WHERE name ILIKE $1 LIMIT 5`, [like]),
    query(`SELECT id, code FROM coupons WHERE code ILIKE $1 LIMIT 5`, [like]),
  ]);

  res.json({
    success: true,
    results: {
      products: products.rows,
      orders: orders.rows,
      customers: customers.rows,
      categories: categories.rows,
      coupons: coupons.rows,
    },
  });
});

module.exports = { globalSearch };
