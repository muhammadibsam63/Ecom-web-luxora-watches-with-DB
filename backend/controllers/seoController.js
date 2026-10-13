const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// GET /sitemap.xml — built from the database so new products/articles appear automatically
const sitemap = asyncHandler(async (req, res) => {
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const [products, collections, articles] = await Promise.all([
    query(`SELECT slug, updated_at FROM products WHERE is_active = TRUE AND status = 'active'`),
    query(`SELECT slug, updated_at FROM collections WHERE is_active = TRUE`),
    query(`SELECT slug, updated_at FROM journal_articles WHERE status = 'published'`),
  ]);

  const urls = [
    ...['', '/shop', '/collections', '/journal', '/about', '/contact', '/build-your-watch', '/faq', '/shipping', '/returns', '/warranty', '/privacy', '/terms']
      .map((p) => ({ loc: `${base}${p}` })),
    ...products.rows.map((r) => ({ loc: `${base}/product/${r.slug}`, lastmod: r.updated_at })),
    ...collections.rows.map((r) => ({ loc: `${base}/shop?collection=${r.slug}`, lastmod: r.updated_at })),
    ...articles.rows.map((r) => ({ loc: `${base}/journal/${r.slug}`, lastmod: r.updated_at })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}</url>`).join('\n') +
    `\n</urlset>`;

  res.type('application/xml').send(xml);
});

module.exports = { sitemap };
