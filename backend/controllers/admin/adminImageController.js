const { query } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const {
  uploadBuffer,
  deleteImage,
} = require('../../config/cloudinary');
const { logActivity } = require('../../utils/activityLog');

const MAX_IMAGES_PER_PRODUCT = 50;

/* =========================================================
   HELPERS
========================================================= */

async function getProduct(productId) {
  const { rows } = await query(
    `
      SELECT id
      FROM products
      WHERE id = $1
    `,
    [productId]
  );

  return rows[0] || null;
}

async function getNextSortOrderAndCount(productId) {
  const { rows } = await query(
    `
      SELECT
        COALESCE(MAX(sort_order), -1)::int AS max_order,
        COUNT(*)::int AS total
      FROM product_images
      WHERE product_id = $1
    `,
    [productId]
  );

  return {
    nextOrder: Number(rows[0]?.max_order ?? -1) + 1,
    existingCount: Number(rows[0]?.total ?? 0),
  };
}

function cleanUrl(value) {
  if (typeof value !== 'string') return '';

  return value.trim();
}

function isValidImageUrl(url) {
  if (!url) return false;

  // Cloudinary / normal HTTPS / HTTP / data URL
  return (
    /^https?:\/\/.+/i.test(url) ||
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(url)
  );
}

/* =========================================================
   UPLOAD IMAGE FILES
   POST /api/admin/products/:id/images

   multipart/form-data
   field name: images
========================================================= */

const uploadProductImages = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;

  // Product check
  const product = await getProduct(productId);

  if (!product) {
    throw ApiError.notFound('Product not found.');
  }

  // Multer files check
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw ApiError.badRequest('No images were uploaded.');
  }

  // Count existing images
  const {
    nextOrder: startOrder,
    existingCount,
  } = await getNextSortOrderAndCount(productId);

  if (
    existingCount + req.files.length >
    MAX_IMAGES_PER_PRODUCT
  ) {
    throw ApiError.badRequest(
      `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images. Currently ${existingCount} exist.`
    );
  }

  let nextOrder = startOrder;

  const inserted = [];

  for (const file of req.files) {
    if (!file || !file.buffer) {
      continue;
    }

    // Upload actual file to Cloudinary
    const uploaded = await uploadBuffer(
      file.buffer,
      'luxora-watches/products'
    );

    if (!uploaded?.url) {
      throw ApiError.badRequest(
        'Image upload failed because Cloudinary did not return an image URL.'
      );
    }

    const imageUrl = String(uploaded.url).trim();
    const publicId = uploaded.publicId || null;

    const { rows } = await query(
      `
        INSERT INTO product_images
        (
          product_id,
          url,
          public_id,
          alt_text,
          image_type,
          sort_order
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          'gallery',
          $5
        )
        RETURNING *
      `,
      [
        productId,
        imageUrl,
        publicId,
        file.originalname || 'Luxora product image',
        nextOrder,
      ]
    );

    if (rows[0]) {
      inserted.push(rows[0]);
    }

    nextOrder++;
  }

  if (!inserted.length) {
    throw ApiError.badRequest(
      'No product images were saved.'
    );
  }

  // Activity log should never prevent successful image saving
  try {
    if (req.user?.id) {
      await logActivity(
        req.user.id,
        'product.images_uploaded',
        'product',
        productId,
        {
          count: inserted.length,
        }
      );
    }
  } catch (error) {
    console.error(
      'Activity log failed after image upload:',
      error
    );
  }

  res.status(201).json({
    success: true,
    message: `${inserted.length} image(s) uploaded successfully.`,
    images: inserted,
  });
});

/* =========================================================
   ADD IMAGE URLS
   POST /api/admin/products/:id/images/url

   {
     "urls": [
       "https://example.com/watch.jpg"
     ]
   }
========================================================= */

const addProductImagesByUrl = asyncHandler(
  async (req, res) => {
    const { id: productId } = req.params;

    const product = await getProduct(productId);

    if (!product) {
      throw ApiError.notFound('Product not found.');
    }

    const urls = Array.isArray(req.body?.urls)
      ? req.body.urls
          .map(cleanUrl)
          .filter(Boolean)
      : [];

    if (!urls.length) {
      throw ApiError.badRequest(
        'No image URLs were provided.'
      );
    }

    // Remove duplicate URLs
    const uniqueUrls = [...new Set(urls)];

    for (const url of uniqueUrls) {
      if (!isValidImageUrl(url)) {
        throw ApiError.badRequest(
          `"${url}" is not a valid image URL.`
        );
      }
    }

    const {
      nextOrder: startOrder,
      existingCount,
    } = await getNextSortOrderAndCount(productId);

    if (
      existingCount + uniqueUrls.length >
      MAX_IMAGES_PER_PRODUCT
    ) {
      throw ApiError.badRequest(
        `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images. Currently ${existingCount} exist.`
      );
    }

    let nextOrder = startOrder;

    const inserted = [];

    for (const url of uniqueUrls) {
      const { rows } = await query(
        `
          INSERT INTO product_images
          (
            product_id,
            url,
            public_id,
            alt_text,
            image_type,
            sort_order
          )
          VALUES
          (
            $1,
            $2,
            NULL,
            NULL,
            'gallery',
            $3
          )
          RETURNING *
        `,
        [
          productId,
          url,
          nextOrder,
        ]
      );

      if (rows[0]) {
        inserted.push(rows[0]);
      }

      nextOrder++;
    }

    try {
      if (req.user?.id) {
        await logActivity(
          req.user.id,
          'product.images_url_added',
          'product',
          productId,
          {
            count: inserted.length,
          }
        );
      }
    } catch (error) {
      console.error(
        'Activity log failed after URL image insert:',
        error
      );
    }

    res.status(201).json({
      success: true,
      message: `${inserted.length} image URL(s) added successfully.`,
      images: inserted,
    });
  }
);

/* =========================================================
   DELETE IMAGE
   DELETE /api/admin/products/:id/images/:imageId
========================================================= */

const deleteProductImage = asyncHandler(
  async (req, res) => {
    const {
      id: productId,
      imageId,
    } = req.params;

    const { rows } = await query(
      `
        DELETE FROM product_images
        WHERE id = $1
          AND product_id = $2
        RETURNING *
      `,
      [
        imageId,
        productId,
      ]
    );

    if (!rows[0]) {
      throw ApiError.notFound(
        'Image not found.'
      );
    }

    // Delete Cloudinary file only if public_id exists
    if (rows[0].public_id) {
      try {
        await deleteImage(rows[0].public_id);
      } catch (error) {
        console.error(
          'Cloudinary image deletion failed:',
          error
        );
      }
    }

    try {
      if (req.user?.id) {
        await logActivity(
          req.user.id,
          'product.image_deleted',
          'product',
          productId,
          {
            imageId,
          }
        );
      }
    } catch (error) {
      console.error(
        'Activity log failed after image deletion:',
        error
      );
    }

    res.json({
      success: true,
      message: 'Image deleted successfully.',
    });
  }
);

/* =========================================================
   REORDER IMAGES
   PATCH /api/admin/products/:id/images/reorder

   {
     "order": [
       "image-id-1",
       "image-id-2"
     ]
   }
========================================================= */

const reorderProductImages = asyncHandler(
  async (req, res) => {
    const { id: productId } = req.params;
    const { order } = req.body;

    if (
      !Array.isArray(order) ||
      !order.length
    ) {
      throw ApiError.badRequest(
        'order must be a non-empty array of image IDs.'
      );
    }

    // Verify all images belong to this product
    const { rows: existingImages } =
      await query(
        `
          SELECT id
          FROM product_images
          WHERE product_id = $1
        `,
        [productId]
      );

    const existingIds = new Set(
      existingImages.map((image) =>
        String(image.id)
      )
    );

    for (const imageId of order) {
      if (
        !existingIds.has(String(imageId))
      ) {
        throw ApiError.badRequest(
          'One or more image IDs do not belong to this product.'
        );
      }
    }

    // Update ordering
    for (let i = 0; i < order.length; i++) {
      await query(
        `
          UPDATE product_images
          SET sort_order = $1
          WHERE id = $2
            AND product_id = $3
        `,
        [
          i,
          order[i],
          productId,
        ]
      );
    }

    const { rows } = await query(
      `
        SELECT *
        FROM product_images
        WHERE product_id = $1
        ORDER BY sort_order ASC
      `,
      [productId]
    );

    res.json({
      success: true,
      images: rows,
    });
  }
);

/* =========================================================
   SET PRIMARY IMAGE
   PATCH /api/admin/products/:id/images/:imageId/primary
========================================================= */

const setPrimaryImage = asyncHandler(
  async (req, res) => {
    const {
      id: productId,
      imageId,
    } = req.params;

    // FIXED: your old SQL had "SELECT * FROM WHERE..."
    const { rows: target } = await query(
      `
        SELECT *
        FROM product_images
        WHERE id = $1
          AND product_id = $2
      `,
      [
        imageId,
        productId,
      ]
    );

    if (!target[0]) {
      throw ApiError.notFound(
        'Image not found.'
      );
    }

    /*
      Move selected image to position 0.

      First temporarily move all other images
      up by 1.
    */
    await query(
      `
        UPDATE product_images
        SET sort_order = sort_order + 1
        WHERE product_id = $1
          AND id != $2
      `,
      [
        productId,
        imageId,
      ]
    );

    // Selected image becomes primary
    await query(
      `
        UPDATE product_images
        SET sort_order = 0
        WHERE id = $1
          AND product_id = $2
      `,
      [
        imageId,
        productId,
      ]
    );

    const { rows } = await query(
      `
        SELECT *
        FROM product_images
        WHERE product_id = $1
        ORDER BY sort_order ASC
      `,
      [productId]
    );

    res.json({
      success: true,
      images: rows,
    });
  }
);

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  uploadProductImages,
  addProductImagesByUrl,
  deleteProductImage,
  reorderProductImages,
  setPrimaryImage,
};