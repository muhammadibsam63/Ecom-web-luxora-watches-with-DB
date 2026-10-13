const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');

// GET /api/admin/coupons
const listCoupons = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json({ success: true, coupons: rows });
});

// POST /api/admin/coupons
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startsAt, expiresAt, isActive } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    throw ApiError.badRequest('code, discountType and discountValue are required.');
  }
  if (!['percentage', 'fixed'].includes(discountType)) {
    throw ApiError.badRequest('discountType must be "percentage" or "fixed".');
  }
  if (discountType === 'percentage' && discountValue > 100) {
    throw ApiError.badRequest('Percentage discount cannot exceed 100.');
  }

  const { rows } = await query(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, per_user_limit, starts_at, expires_at, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [code.toUpperCase(), discountType, discountValue, minOrderAmount || 0, maxDiscount || null, usageLimit || null, perUserLimit || 1, startsAt || null, expiresAt || null, isActive !== false]
  );
  await logActivity(req.user.id, 'coupon.created', 'coupon', rows[0].id, { code: rows[0].code });
  res.status(201).json({ success: true, coupon: rows[0] });
});

// PATCH /api/admin/coupons/:id
const updateCoupon = asyncHandler(async (req, res) => {
  const { discountValue, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startsAt, expiresAt, isActive } = req.body;
  const { rows } = await query(
    `UPDATE coupons SET
       discount_value = COALESCE($1, discount_value),
       min_order_amount = COALESCE($2, min_order_amount),
       max_discount = COALESCE($3, max_discount),
       usage_limit = COALESCE($4, usage_limit),
       per_user_limit = COALESCE($5, per_user_limit),
       starts_at = COALESCE($6, starts_at),
       expires_at = COALESCE($7, expires_at),
       is_active = COALESCE($8, is_active)
     WHERE id = $9 RETURNING *`,
    [discountValue, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startsAt, expiresAt, isActive, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Coupon not found.');
  await logActivity(req.user.id, 'coupon.updated', 'coupon', req.params.id);
  res.json({ success: true, coupon: rows[0] });
});

// DELETE /api/admin/coupons/:id
const deleteCoupon = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM coupons WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Coupon not found.');
  await logActivity(req.user.id, 'coupon.deleted', 'coupon', req.params.id);
  res.json({ success: true, message: 'Coupon deleted.' });
});

module.exports = { listCoupons, createCoupon, updateCoupon, deleteCoupon };
