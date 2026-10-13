const slugify = require('slugify');
const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/collections — public, active only
const listCollections = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM collections c
     LEFT JOIN products p ON p.collection_id = c.id AND p.is_active = TRUE
     WHERE c.is_active = TRUE
     GROUP BY c.id
     ORDER BY c.display_order ASC, c.name ASC`
  );
  res.json({ success: true, collections: rows });
});

// GET /api/collections/:slug — public detail + its products
const getCollectionBySlug = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM collections WHERE slug = $1 AND is_active = TRUE', [req.params.slug]);
  const collection = rows[0];
  if (!collection) throw ApiError.notFound('Collection not found.');

  const { rows: products } = await query(
    `SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image
     FROM products p WHERE p.collection_id = $1 AND p.is_active = TRUE ORDER BY p.created_at DESC`,
    [collection.id]
  );
  res.json({ success: true, collection, products });
});

module.exports = { listCollections, getCollectionBySlug };
