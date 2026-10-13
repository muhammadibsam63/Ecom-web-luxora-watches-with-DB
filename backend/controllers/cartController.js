const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

async function getCartWithProducts(userId) {
  const { rows } = await query(
    `SELECT ci.id, ci.quantity, ci.custom_config, ci.created_at,
            p.id AS product_id, p.name, p.slug, p.brand, p.price, p.stock,
            (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId]
  );
  return rows;
}

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const items = await getCartWithProducts(req.user.id);
  res.json({ success: true, items });
});

// POST /api/cart  { productId, quantity, customConfig? }
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, customConfig = null } = req.body;
  if (!productId) throw ApiError.badRequest('productId is required.');

  const { rows: productRows } = await query('SELECT id, stock FROM products WHERE id = $1 AND is_active = TRUE', [productId]);
  if (!productRows[0]) throw ApiError.notFound('Product not found.');
  if (productRows[0].stock < quantity) throw ApiError.badRequest('Not enough stock available.');

  await query(
    `INSERT INTO cart_items (user_id, product_id, quantity, custom_config)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, product_id, custom_config)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
    [req.user.id, productId, quantity, customConfig]
  );

  const items = await getCartWithProducts(req.user.id);
  res.status(201).json({ success: true, items });
});

// PATCH /api/cart/:itemId  { quantity }
const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw ApiError.badRequest('quantity must be at least 1.');

  const { rows } = await query(
    `UPDATE cart_items SET quantity = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 RETURNING id`,
    [quantity, itemId, req.user.id]
  );
  if (!rows[0]) throw ApiError.notFound('Cart item not found.');

  const items = await getCartWithProducts(req.user.id);
  res.json({ success: true, items });
});

// DELETE /api/cart/:itemId
const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { rows } = await query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
    [itemId, req.user.id]
  );
  if (!rows[0]) throw ApiError.notFound('Cart item not found.');

  const items = await getCartWithProducts(req.user.id);
  res.json({ success: true, items });
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
  res.json({ success: true, items: [] });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, getCartWithProducts };
