const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');
const { recalculateRating } = require('../reviewController');

// GET /api/admin/reviews
const listAllReviews = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = [];
  const params = [];
  let i = 1;
  if (status) { where.push(`r.status = $${i}`); params.push(status); i++; }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM reviews r ${whereClause}`, params);
  const { rows } = await query(
    `SELECT r.*, u.full_name AS reviewer_name, u.email AS reviewer_email, p.name AS product_name, p.slug AS product_slug
     FROM reviews r JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
     ${whereClause} ORDER BY r.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limitNum, offset]
  );
  res.json({ success: true, reviews: rows, pagination: { page: pageNum, limit: limitNum, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limitNum) } });
});

// PATCH /api/admin/reviews/:id/status  { status }
const setReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'hidden'].includes(status)) throw ApiError.badRequest('Invalid status.');

  const { rows } = await query('UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Review not found.');
  await recalculateRating(rows[0].product_id);
  await logActivity(req.user.id, `review.${status}`, 'review', req.params.id);
  res.json({ success: true, review: rows[0] });
});

// DELETE /api/admin/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM reviews WHERE id = $1 RETURNING product_id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Review not found.');
  await recalculateRating(rows[0].product_id);
  await logActivity(req.user.id, 'review.deleted', 'review', req.params.id);
  res.json({ success: true, message: 'Review deleted.' });
});

module.exports = { listAllReviews, setReviewStatus, deleteReview };
