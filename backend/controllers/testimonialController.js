const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/testimonials — approved only
const listTestimonials = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT id, customer_name, role_location, text, rating, avatar_url
     FROM testimonials WHERE status = 'approved' ORDER BY display_order ASC, created_at DESC LIMIT 12`
  );
  res.json({ success: true, testimonials: rows });
});

module.exports = { listTestimonials };
