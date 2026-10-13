const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/journal
const listArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const offset = (pageNum - 1) * limitNum;

  const where = ["status = 'published'"];
  const params = [];
  let i = 1;
  if (category) { where.push(`category = $${i}`); params.push(category); i++; }

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM journal_articles WHERE ${where.join(' AND ')}`, params);
  const { rows } = await query(
    `SELECT id, title, slug, excerpt, cover_image, author, category, published_at
     FROM journal_articles WHERE ${where.join(' AND ')}
     ORDER BY published_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limitNum, offset]
  );

  res.json({
    success: true, articles: rows,
    pagination: { page: pageNum, limit: limitNum, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limitNum) },
  });
});

// GET /api/journal/:slug
const getArticleBySlug = asyncHandler(async (req, res) => {
  const { rows } = await query(`SELECT * FROM journal_articles WHERE slug = $1 AND status = 'published'`, [req.params.slug]);
  if (!rows[0]) throw ApiError.notFound('Article not found.');
  res.json({ success: true, article: rows[0] });
});

module.exports = { listArticles, getArticleBySlug };
