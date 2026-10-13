const slugify = require('slugify');
const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { logActivity } = require('../../utils/activityLog');

// GET /api/admin/journal
const listAllArticles = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = [];
  const params = [];
  let i = 1;
  if (status) { where.push(`status = $${i}`); params.push(status); i++; }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM journal_articles ${whereClause}`, params);
  const { rows } = await query(
    `SELECT id, title, slug, excerpt, cover_image, author, category, status, published_at, created_at
     FROM journal_articles ${whereClause} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limitNum, offset]
  );
  res.json({ success: true, articles: rows, pagination: { page: pageNum, limit: limitNum, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limitNum) } });
});

// POST /api/admin/journal
const createArticle = asyncHandler(async (req, res) => {
  const { title, excerpt, content, coverImage, author, category, status } = req.body;
  if (!title || !content) throw ApiError.badRequest('title and content are required.');
  const slug = slugify(title, { lower: true, strict: true });
  const publish = status === 'published';

  const { rows } = await query(
    `INSERT INTO journal_articles (title, slug, excerpt, content, cover_image, author, category, status, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [title, slug, excerpt || null, content, coverImage || null, author || 'Luxora Editorial', category || null, publish ? 'published' : 'draft', publish ? new Date() : null]
  );
  await logActivity(req.user.id, 'journal.created', 'journal_article', rows[0].id, { title });
  res.status(201).json({ success: true, article: rows[0] });
});

// PATCH /api/admin/journal/:id
const updateArticle = asyncHandler(async (req, res) => {
  const { title, excerpt, content, coverImage, author, category } = req.body;
  const slug = title ? slugify(title, { lower: true, strict: true }) : null;

  const { rows } = await query(
    `UPDATE journal_articles SET
       title = COALESCE($1, title), slug = COALESCE($2, slug), excerpt = COALESCE($3, excerpt),
       content = COALESCE($4, content), cover_image = COALESCE($5, cover_image),
       author = COALESCE($6, author), category = COALESCE($7, category)
     WHERE id = $8 RETURNING *`,
    [title, slug, excerpt, content, coverImage, author, category, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Article not found.');
  await logActivity(req.user.id, 'journal.updated', 'journal_article', req.params.id);
  res.json({ success: true, article: rows[0] });
});

// PATCH /api/admin/journal/:id/status  { status: 'published'|'draft' }
const setArticleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['published', 'draft'].includes(status)) throw ApiError.badRequest('Invalid status.');

  const { rows } = await query(
    `UPDATE journal_articles SET status = $1, published_at = CASE WHEN $1 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END
     WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  if (!rows[0]) throw ApiError.notFound('Article not found.');
  await logActivity(req.user.id, status === 'published' ? 'journal.published' : 'journal.unpublished', 'journal_article', req.params.id);
  res.json({ success: true, article: rows[0] });
});

// DELETE /api/admin/journal/:id
const deleteArticle = asyncHandler(async (req, res) => {
  const { rows } = await query('DELETE FROM journal_articles WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) throw ApiError.notFound('Article not found.');
  await logActivity(req.user.id, 'journal.deleted', 'journal_article', req.params.id);
  res.json({ success: true, message: 'Article deleted.' });
});

module.exports = { listAllArticles, createArticle, updateArticle, setArticleStatus, deleteArticle };
