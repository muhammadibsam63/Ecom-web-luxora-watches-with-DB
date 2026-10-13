const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const SORT_MAP = {
  featured: 'p.is_featured DESC, p.created_at DESC',
  newest: 'p.created_at DESC',
  best_selling: 'p.is_best_seller DESC, p.rating_count DESC',
  price_low: 'p.price ASC',
  price_high: 'p.price DESC',
  rating: 'p.rating_average DESC',
};

async function attachImages(products) {
  if (!products.length) return products;

  const ids = products.map((p) => p.id);

  const { rows: images } = await query(
    `SELECT *
     FROM product_images
     WHERE product_id = ANY($1::uuid[])
     ORDER BY sort_order ASC`,
    [ids]
  );

  const byProduct = {};

  images.forEach((img) => {
    byProduct[img.product_id] = byProduct[img.product_id] || [];
    byProduct[img.product_id].push(img);
  });

  return products.map((p) => ({
    ...p,
    images: byProduct[p.id] || [],
  }));
}

// GET /api/products
const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    movement,
    material,
    dialColor,
    strap,
    minPrice,
    maxPrice,
    availability,
    sort = 'featured',
    page = 1,
    limit = 12,
  } = req.query;

  const where = ['p.is_active = TRUE'];
  const params = [];
  let i = 1;

  if (search) {
    where.push(
      `(p.name ILIKE $${i} OR p.brand ILIKE $${i} OR p.description ILIKE $${i})`
    );
    params.push(`%${search}%`);
    i++;
  }

  if (category) {
    where.push(`c.slug = $${i}`);
    params.push(category);
    i++;
  }

  if (movement) {
    where.push(`p.movement ILIKE $${i}`);
    params.push(movement);
    i++;
  }

  if (material) {
    where.push(`p.case_material ILIKE $${i}`);
    params.push(material);
    i++;
  }

  if (dialColor) {
    where.push(`p.dial_color ILIKE $${i}`);
    params.push(dialColor);
    i++;
  }

  if (strap) {
    where.push(`p.strap_material ILIKE $${i}`);
    params.push(strap);
    i++;
  }

  if (minPrice) {
    where.push(`p.price >= $${i}`);
    params.push(minPrice);
    i++;
  }

  if (maxPrice) {
    where.push(`p.price <= $${i}`);
    params.push(maxPrice);
    i++;
  }

  if (availability === 'in_stock') {
    where.push(`p.stock > 0`);
  } else if (availability === 'out_of_stock') {
    where.push(`p.stock = 0`);
  }

  const orderBy = SORT_MAP[sort] || SORT_MAP.featured;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);

  const limitNum = Math.min(
    Math.max(parseInt(limit, 10) || 12, 1),
    60
  );

  const offset = (pageNum - 1) * limitNum;

  const whereClause = where.length
    ? `WHERE ${where.join(' AND ')}`
    : '';

  // Total products
  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;

  // Products
  const dataParams = [...params, limitNum, offset];

  const { rows: products } = await query(
    `SELECT p.*, 
            c.name AS category_name,
            c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT $${i}
     OFFSET $${i + 1}`,
    dataParams
  );

  const withImages = await attachImages(products);

  res.json({
    success: true,
    products: withImages,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Get product
  const { rows } = await query(
    `SELECT p.*, 
            c.name AS category_name,
            c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1
       AND p.is_active = TRUE`,
    [slug]
  );

  const product = rows[0];

  if (!product) {
    throw ApiError.notFound('Product not found.');
  }

  // Attach product images
  const [withImages] = await attachImages([product]);

  // Get reviews
  // IMPORTANT:
  // reviews table does not have a "status" column,
  // so we do not filter by r.status.
  const { rows: reviews } = await query(
    `SELECT
        r.id,
        r.rating,
        r.comment,
        r.is_verified_purchase,
        r.created_at,
        u.full_name AS reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC
     LIMIT 20`,
    [product.id]
  );

  // Get related products
  const { rows: related } = await query(
    `SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.brand
     FROM products p
     WHERE p.category_id = $1
       AND p.id != $2
       AND p.is_active = TRUE
     ORDER BY p.rating_average DESC
     LIMIT 4`,
    [product.category_id, product.id]
  );

  res.json({
    success: true,
    product: withImages,
    reviews,
    related,
  });
});

module.exports = {
  listProducts,
  getProductBySlug,
  attachImages,
};