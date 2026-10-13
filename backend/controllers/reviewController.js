const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { notifyAdmins } = require('../utils/notify');

async function recalculateRating(productId) {
  const { rows } = await query(
    `SELECT
       COUNT(*)::int AS count,
       COALESCE(AVG(rating), 0) AS avg
     FROM reviews
     WHERE product_id = $1`,
    [productId]
  );

  const { count, avg } = rows[0];

  await query(
    `UPDATE products
     SET rating_count = $1,
         rating_average = $2
     WHERE id = $3`,
    [count, Number(avg).toFixed(1), productId]
  );
}

// POST /api/reviews
// { productId, rating, comment }
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    throw ApiError.badRequest(
      'productId and rating are required.'
    );
  }

  const numericRating = Number(rating);

  if (
    !Number.isFinite(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw ApiError.badRequest(
      'Rating must be between 1 and 5.'
    );
  }

  // Prevent duplicate review from same user
  const { rows: existing } = await query(
    `SELECT id
     FROM reviews
     WHERE product_id = $1
       AND user_id = $2`,
    [productId, req.user.id]
  );

  if (existing.length) {
    throw ApiError.conflict(
      'You have already reviewed this product.'
    );
  }

  // Verified purchase check
  const { rows: purchaseRows } = await query(
    `SELECT oi.order_id
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.product_id = $1
       AND o.user_id = $2
       AND o.status = 'delivered'
     LIMIT 1`,
    [productId, req.user.id]
  );

  const isVerified = purchaseRows.length > 0;
  const orderId = isVerified
    ? purchaseRows[0].order_id
    : null;

  // Create review
  const { rows } = await query(
    `INSERT INTO reviews
      (
        product_id,
        user_id,
        order_id,
        rating,
        comment,
        is_verified_purchase
      )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      productId,
      req.user.id,
      orderId,
      numericRating,
      comment || null,
      isVerified,
    ]
  );

  // Recalculate product rating
  await recalculateRating(productId);

  // Notify admins
  notifyAdmins(
    'new_review',
    'New product review',
    `${numericRating}★ review submitted`,
    '/admin/reviews'
  );

  res.status(201).json({
    success: true,
    review: rows[0],
  });
});

// GET /api/reviews/product/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { rows } = await query(
    `SELECT
       r.*,
       u.full_name AS reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );

  res.json({
    success: true,
    reviews: rows,
  });
});

module.exports = {
  createReview,
  getProductReviews,
  recalculateRating,
};