const { query } = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

// GET /api/admin/analytics/overview
const getOverview = asyncHandler(async (req, res) => {
  const [
    revenue, orderCounts, userCount, productCount, pendingOrders, lowStock, deliveredOrders,
  ] = await Promise.all([
    query(`SELECT COALESCE(SUM(total),0) AS revenue FROM orders WHERE payment_status = 'paid'`),
    query(`SELECT COUNT(*)::int AS total FROM orders`),
    query(`SELECT COUNT(*)::int AS total FROM users WHERE role = 'customer'`),
    query(`SELECT COUNT(*)::int AS total FROM products WHERE is_active = TRUE`),
    query(`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'pending'`),
    query(`SELECT COUNT(*)::int AS total FROM products WHERE stock <= low_stock_threshold AND stock > 0`),
    query(`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'delivered'`),
  ]);

  res.json({
    success: true,
    stats: {
      revenue: Number(revenue.rows[0].revenue),
      orders: orderCounts.rows[0].total,
      users: userCount.rows[0].total,
      products: productCount.rows[0].total,
      pendingOrders: pendingOrders.rows[0].total,
      lowStock: lowStock.rows[0].total,
      deliveredOrders: deliveredOrders.rows[0].total,
    },
  });
});

// GET /api/admin/analytics/charts
const getCharts = asyncHandler(async (req, res) => {
  const [revenueByMonth, ordersByStatus, salesByCategory, topProducts, customerRegistrations, inventoryDistribution] = await Promise.all([
    query(`
      SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
             SUM(total)::float AS revenue
      FROM orders
      WHERE created_at > NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at) ASC
    `),
    query(`SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`),
    query(`
      SELECT c.name AS category, SUM(oi.unit_price * oi.quantity)::float AS revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      GROUP BY c.name
      ORDER BY revenue DESC
    `),
    query(`
      SELECT p.name, SUM(oi.quantity)::int AS units_sold, SUM(oi.unit_price * oi.quantity)::float AS revenue
      FROM order_items oi JOIN products p ON p.id = oi.product_id
      GROUP BY p.name ORDER BY units_sold DESC LIMIT 5
    `),
    query(`
      SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS month, COUNT(*)::int AS count
      FROM users WHERE role = 'customer' AND created_at > NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at) ASC
    `),
    query(`
      SELECT
        CASE WHEN stock = 0 THEN 'Out of Stock' WHEN stock <= low_stock_threshold THEN 'Low Stock' ELSE 'In Stock' END AS status,
        COUNT(*)::int AS count
      FROM products WHERE is_active = TRUE GROUP BY 1
    `),
  ]);

  res.json({
    success: true,
    charts: {
      revenueByMonth: revenueByMonth.rows,
      ordersByStatus: ordersByStatus.rows,
      salesByCategory: salesByCategory.rows,
      topProducts: topProducts.rows,
      customerRegistrations: customerRegistrations.rows,
      inventoryDistribution: inventoryDistribution.rows,
    },
  });
});

// GET /api/admin/inventory
const getInventory = asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT id, name, sku, stock, reserved_stock, (stock - reserved_stock) AS available_stock, low_stock_threshold,
      CASE WHEN stock = 0 THEN 'out_of_stock'
           WHEN stock <= low_stock_threshold THEN 'low_stock'
           ELSE 'in_stock' END AS status
    FROM products WHERE is_active = TRUE ORDER BY stock ASC
  `);
  res.json({ success: true, inventory: rows });
});

module.exports = { getOverview, getCharts, getInventory };
