const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');

// GET /api/admin/testimonials
const listAllTestimonials = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.json({ success: true, testimonials: rows });
});

// POST /api/admin/testimonials
const createTestimonial = asyncHandler(async (req, res) => {
  const { customerName, roleLocation, text, rating, avatarUrl, status, displayOrder } = req.body;
  if (!customerName || !text) throw ApiError.badRequest('customerName and text are required.');

  const { rows } = await query(
    `INSERT INTO testimonials (customer_name, role_location, text, rating, avatar_url, status, display_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [customerName, roleLocation || null, text, rating || 5, avatarUrl || null, status || 'pending', displayOrder || 0]
  );
  await logActivity(req.user.id, 'testimonial.created', 'testimonial', rows[0].id);
  res.status(201).json({ success: true, testimonial: rows[0] });
});

// PATCH /api/admin/testimonials/:id
const updateTestimonial = asyncHandler(async (req, res) => {
  const { customerName, roleLocation, text, rating, avatarUrl, status, displayOrder } = req.body;
  const { rows } = await query(
    `UPDATE testimonials SET
       customer_name = COALESCE($1, customer_name), role_location = COALESCE($2, role_location),
       text = COALESCE($3, text), rating = COALESCE($4, rating), avatar_url = COALESCE($5, avatar_url),
       status = COALESCE($6, status), display_order = COALESCE($7, display_order)
     WHERE id = $8 RETURNING *`,
    [customerName, roleLocation, text, rating, avatarUrl, status, displayOrder, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Testimonial not found.');
  await logActivity(req.user.id, 'testimonial.updated', 'testimonial', req.params.id);
  res.json({ success: true, testimonial: rows[0] });
});

// DELETE /api/admin/testimonials/:id
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Testimonial not found.');
  await logActivity(req.user.id, 'testimonial.deleted', 'testimonial', req.params.id);
  res.json({ success: true, message: 'Testimonial deleted.' });
});

module.exports = { listAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
