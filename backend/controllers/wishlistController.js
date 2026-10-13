const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT wi.id, wi.created_at,
            p.id AS product_id, p.name, p.slug, p.brand, p.price, p.stock, p.rating_average,
            (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image
     FROM wishlist_items wi
     JOIN products p ON p.id = wi.product_id
     WHERE wi.user_id = $1
     ORDER BY wi.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, items: rows });
});

// POST /api/wishlist  { productId }
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw ApiError.badRequest('productId is required.');

  const { rows: productRows } = await query('SELECT id FROM products WHERE id = $1 AND is_active = TRUE', [productId]);
  if (!productRows[0]) throw ApiError.notFound('Product not found.');

  await query(
    `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [req.user.id, productId]
  );
  res.status(201).json({ success: true });
});

// DELETE /api/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
  res.json({ success: true });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
