const slugify = require('slugify');
const { query, withTransaction } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const { attachImages } = require('../productController');

// ============================================================
// NUMERIC FIELD HELPERS
// ============================================================

const NUMERIC_FIELDS = new Set([
  'price',
  'comparePrice',
  'categoryId',
  'stock',
]);

const REQUIRED_NUMERIC_FIELDS = new Set([
  'price',
  'stock',
]);

function normalizeNumericFields(body) {
  const out = { ...body };

  for (const key of NUMERIC_FIELDS) {
    if (out[key] === '') {
      if (REQUIRED_NUMERIC_FIELDS.has(key)) {
        throw ApiError.badRequest(`${key} cannot be empty.`);
      }

      out[key] = null;
    }
  }

  return out;
}

// ============================================================
// GET /api/admin/products
// ============================================================

const listAllProducts = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const where = [];
  const params = [];
  let i = 1;

  if (search) {
    where.push(
      `(name ILIKE $${i}
        OR sku ILIKE $${i}
        OR brand ILIKE $${i})`
    );

    params.push(`%${search}%`);
    i++;
  }

  const whereClause = where.length
    ? `WHERE ${where.join(' AND ')}`
    : '';

  const pageNum = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const limitNum = Math.min(
    Math.max(parseInt(limit, 10) || 20, 1),
    100
  );

  const offset = (pageNum - 1) * limitNum;

  // Total count
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total
     FROM products
     ${whereClause}`,
    params
  );

  // Products
  const { rows } = await query(
    `SELECT
       p.*,
       c.name AS category_name
     FROM products p
     LEFT JOIN categories c
       ON c.id = p.category_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${i}
     OFFSET $${i + 1}`,
    [
      ...params,
      limitNum,
      offset,
    ]
  );

  // Attach Cloudinary/product images
  const withImages = await attachImages(rows);

  const total = countRows[0]?.total || 0;

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

// ============================================================
// POST /api/admin/products
// ============================================================

const createProduct = asyncHandler(async (req, res) => {
  const b = normalizeNumericFields(req.body);

  if (!b.name || !b.price || !b.sku) {
    throw ApiError.badRequest(
      'name, price and sku are required.'
    );
  }

  const slug = slugify(b.name, {
    lower: true,
    strict: true,
  });

  const product = await withTransaction(async (client) => {
    // Create product
    const { rows } = await client.query(
      `INSERT INTO products
        (
          name,
          slug,
          brand,
          description,
          short_description,
          price,
          compare_price,
          category_id,
          stock,
          sku,
          movement,
          case_material,
          case_diameter,
          case_thickness,
          water_resistance,
          strap_material,
          dial_color,
          crystal,
          power_reserve,
          warranty,
          is_featured,
          is_new_arrival,
          is_best_seller,
          is_active
        )
       VALUES
        (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24
        )
       RETURNING *`,
      [
        b.name,
        slug,
        b.brand || 'Luxora',
        b.description || '',
        b.shortDescription || null,
        b.price,
        b.comparePrice || null,
        b.categoryId || null,
        b.stock ?? 0,
        b.sku,

        b.movement || null,
        b.caseMaterial || null,
        b.caseDiameter || null,
        b.caseThickness || null,
        b.waterResistance || null,
        b.strapMaterial || null,
        b.dialColor || null,
        b.crystal || null,
        b.powerReserve || null,
        b.warranty || null,

        !!b.isFeatured,
        !!b.isNewArrival,
        !!b.isBestSeller,
        b.isActive !== false,
      ]
    );

    const newProduct = rows[0];

    // Add product images
    if (
      Array.isArray(b.images) &&
      b.images.length
    ) {
      for (
        let idx = 0;
        idx < b.images.length;
        idx++
      ) {
        const img = b.images[idx];

        if (!img?.url) continue;

        await client.query(
          `INSERT INTO product_images
            (
              product_id,
              url,
              alt_text,
              image_type,
              sort_order
            )
           VALUES ($1,$2,$3,$4,$5)`,
          [
            newProduct.id,
            img.url,
            img.altText || b.name,
            img.type || 'gallery',
            idx,
          ]
        );
      }
    }

    return newProduct;
  });

  res.status(201).json({
    success: true,
    product,
  });
});

// ============================================================
// PATCH /api/admin/products/:id
// ============================================================

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const b = normalizeNumericFields(req.body);

  const fieldMap = {
    name: 'name',
    brand: 'brand',
    description: 'description',
    shortDescription: 'short_description',

    price: 'price',
    comparePrice: 'compare_price',
    categoryId: 'category_id',
    stock: 'stock',
    sku: 'sku',

    movement: 'movement',
    caseMaterial: 'case_material',
    caseDiameter: 'case_diameter',
    caseThickness: 'case_thickness',
    waterResistance: 'water_resistance',
    strapMaterial: 'strap_material',
    dialColor: 'dial_color',
    crystal: 'crystal',
    powerReserve: 'power_reserve',
    warranty: 'warranty',

    isFeatured: 'is_featured',
    isNewArrival: 'is_new_arrival',
    isBestSeller: 'is_best_seller',
    isActive: 'is_active',
  };

  const sets = [];
  const params = [];

  let i = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    if (b[key] !== undefined) {
      sets.push(`${column} = $${i}`);
      params.push(b[key]);
      i++;
    }
  }

  // Update slug if name changed
  if (b.name) {
    sets.push(`slug = $${i}`);

    params.push(
      slugify(b.name, {
        lower: true,
        strict: true,
      })
    );

    i++;
  }

  if (!sets.length) {
    throw ApiError.badRequest(
      'No fields to update.'
    );
  }

  params.push(id);

  const { rows } = await query(
    `UPDATE products
     SET ${sets.join(', ')}
     WHERE id = $${i}
     RETURNING *`,
    params
  );

  if (!rows[0]) {
    throw ApiError.notFound(
      'Product not found.'
    );
  }

  res.json({
    success: true,
    product: rows[0],
  });
});

// ============================================================
// DELETE /api/admin/products/:id
// ============================================================

const deleteProduct = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `DELETE FROM products
     WHERE id = $1
     RETURNING id, name`,
    [req.params.id]
  );

  if (!rows[0]) {
    throw ApiError.notFound(
      'Product not found.'
    );
  }

  res.json({
    success: true,
    message: 'Product deleted.',
  });
});

// ============================================================
// PATCH /api/admin/products/:id/stock
// ============================================================

const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  if (
    stock === undefined ||
    stock === null ||
    Number(stock) < 0
  ) {
    throw ApiError.badRequest(
      'Valid stock value is required.'
    );
  }

  const { rows } = await query(
    `UPDATE products
     SET stock = $1
     WHERE id = $2
     RETURNING *`,
    [
      Number(stock),
      req.params.id,
    ]
  );

  if (!rows[0]) {
    throw ApiError.notFound(
      'Product not found.'
    );
  }

  res.json({
    success: true,
    product: rows[0],
  });
});

// ============================================================
// POST /api/admin/products/bulk
//
// Actions:
// delete
// activate
// deactivate
// feature
// unfeature
// archive
// category
// stock
// ============================================================

const bulkUpdate = asyncHandler(async (req, res) => {
  const {
    ids,
    action,
    value,
  } = req.body;

  if (
    !Array.isArray(ids) ||
    !ids.length
  ) {
    throw ApiError.badRequest(
      'ids must be a non-empty array.'
    );
  }

  const ACTIONS = {
    // Delete products
    delete: async () => {
      return query(
        `DELETE FROM products
         WHERE id = ANY($1::uuid[])`,
        [ids]
      );
    },

    // Activate products
    activate: async () => {
      return query(
        `UPDATE products
         SET is_active = TRUE
         WHERE id = ANY($1::uuid[])`,
        [ids]
      );
    },

    // Deactivate products
    deactivate: async () => {
      return query(
        `UPDATE products
         SET is_active = FALSE
         WHERE id = ANY($1::uuid[])`,
        [ids]
      );
    },

    // Mark featured
    feature: async () => {
      return query(
        `UPDATE products
         SET is_featured = TRUE
         WHERE id = ANY($1::uuid[])`,
        [ids]
      );
    },

    // Remove featured
    unfeature: async () => {
      return query(
        `UPDATE products
         SET is_featured = FALSE
         WHERE id = ANY($1::uuid[])`,
        [ids]
      );
    },

    // Archive = deactivate
    // because products.status does NOT exist
    archive: async () => {
      return query(
        `UPDATE products
         SET is_active = FALSE
         WHERE id = ANY($1::uuid[])`,
        [ids]
      );
    },

    // Change category
    category: async () => {
      if (
        value === undefined ||
        value === null ||
        value === ''
      ) {
        throw ApiError.badRequest(
          'value (categoryId) is required for the category action.'
        );
      }

      return query(
        `UPDATE products
         SET category_id = $2
         WHERE id = ANY($1::uuid[])`,
        [
          ids,
          value,
        ]
      );
    },

    // Change stock
    stock: async () => {
      if (
        value === undefined ||
        value === null ||
        Number(value) < 0
      ) {
        throw ApiError.badRequest(
          'value (stock) is required for the stock action.'
        );
      }

      return query(
        `UPDATE products
         SET stock = $2
         WHERE id = ANY($1::uuid[])`,
        [
          ids,
          Number(value),
        ]
      );
    },
  };

  if (!ACTIONS[action]) {
    throw ApiError.badRequest(
      `Unknown bulk action: ${action}`
    );
  }

  await ACTIONS[action]();

  res.json({
    success: true,
    updated: ids.length,
  });
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  bulkUpdate,
};