const slugify = require('slugify');
const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');

// GET /api/admin/categories
const listAllCategories = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.display_order ASC, c.name ASC`
  );
  res.json({ success: true, categories: rows });
});

// POST /api/admin/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, displayOrder, isActive } = req.body;
  if (!name) throw ApiError.badRequest('name is required.');
  const slug = slugify(name, { lower: true, strict: true });

  const { rows } = await query(
    `INSERT INTO categories (name, slug, description, image_url, display_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, slug, description || null, imageUrl || null, displayOrder || 0, isActive !== false]
  );
  await logActivity(req.user.id, 'category.created', 'category', rows[0].id, { name });
  res.status(201).json({ success: true, category: rows[0] });
});

// PATCH /api/admin/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, displayOrder, isActive } = req.body;
  const slug = name ? slugify(name, { lower: true, strict: true }) : null;

  const { rows } = await query(
    `UPDATE categories SET
       name = COALESCE($1, name), slug = COALESCE($2, slug), description = COALESCE($3, description),
       image_url = COALESCE($4, image_url), display_order = COALESCE($5, display_order), is_active = COALESCE($6, is_active)
     WHERE id = $7 RETURNING *`,
    [name, slug, description, imageUrl, displayOrder, isActive, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Category not found.');
  await logActivity(req.user.id, 'category.updated', 'category', req.params.id);
  res.json({ success: true, category: rows[0] });
});

// DELETE /api/admin/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Category not found.');
  await logActivity(req.user.id, 'category.deleted', 'category', req.params.id);
  res.json({ success: true, message: 'Category deleted.' });
});

module.exports = { listAllCategories, createCategory, updateCategory, deleteCategory };
