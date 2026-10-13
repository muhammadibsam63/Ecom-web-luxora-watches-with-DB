const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/categories
const listCategories = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
     GROUP BY c.id
     ORDER BY c.name ASC`
  );
  res.json({ success: true, categories: rows });
});

module.exports = { listCategories };
