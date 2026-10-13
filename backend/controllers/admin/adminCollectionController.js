const slugify = require('slugify');
const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');

// GET /api/admin/collections
const listAllCollections = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM collections c LEFT JOIN products p ON p.collection_id = c.id
     GROUP BY c.id ORDER BY c.display_order ASC, c.name ASC`
  );
  res.json({ success: true, collections: rows });
});

// POST /api/admin/collections
const createCollection = asyncHandler(async (req, res) => {
  const { name, description, heroImage, bannerImage, displayOrder, isActive } = req.body;
  if (!name) throw ApiError.badRequest('name is required.');
  const slug = slugify(name, { lower: true, strict: true });

  const { rows } = await query(
    `INSERT INTO collections (name, slug, description, hero_image, banner_image, display_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, slug, description || null, heroImage || null, bannerImage || null, displayOrder || 0, isActive !== false]
  );
  await logActivity(req.user.id, 'collection.created', 'collection', rows[0].id, { name });
  res.status(201).json({ success: true, collection: rows[0] });
});

// PATCH /api/admin/collections/:id
const updateCollection = asyncHandler(async (req, res) => {
  const { name, description, heroImage, bannerImage, displayOrder, isActive } = req.body;
  const slug = name ? slugify(name, { lower: true, strict: true }) : null;

  const { rows } = await query(
    `UPDATE collections SET
       name = COALESCE($1, name), slug = COALESCE($2, slug), description = COALESCE($3, description),
       hero_image = COALESCE($4, hero_image), banner_image = COALESCE($5, banner_image),
       display_order = COALESCE($6, display_order), is_active = COALESCE($7, is_active)
     WHERE id = $8 RETURNING *`,
    [name, slug, description, heroImage, bannerImage, displayOrder, isActive, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Collection not found.');
  await logActivity(req.user.id, 'collection.updated', 'collection', req.params.id);
  res.json({ success: true, collection: rows[0] });
});

// DELETE /api/admin/collections/:id
const deleteCollection = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM collections WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Collection not found.');
  await logActivity(req.user.id, 'collection.deleted', 'collection', req.params.id);
  res.json({ success: true, message: 'Collection deleted.' });
});

module.exports = { listAllCollections, createCollection, updateCollection, deleteCollection };
