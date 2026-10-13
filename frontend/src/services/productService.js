import api from './api';

/* ---------------------------------------------
   IMAGE NORMALIZER
--------------------------------------------- */

function parseJson(value) {
  if (typeof value !== 'string') return value;

  const text = value.trim();

  if (!text) return null;

  // JSON array/object ho to parse karo
  if (
    (text.startsWith('[') && text.endsWith(']')) ||
    (text.startsWith('{') && text.endsWith('}'))
  ) {
    try {
      return JSON.parse(text);
    } catch {
      return value;
    }
  }

  return value;
}

function extractImageUrl(value) {
  value = parseJson(value);

  if (!value) return null;

  // Direct string
  if (typeof value === 'string') {
    const url = value.trim();

    if (!url) return null;

    return url;
  }

  // Object
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      value.url ||
      value.src ||
      value.image ||
      value.image_url ||
      value.imageUrl ||
      value.secure_url ||
      value.path ||
      null
    );
  }

  return null;
}

function normalizeImages(product) {
  if (!product) return [];

  const sources = [
    product.images,
    product.gallery,
    product.gallery_images,
    product.product_images,
    product.photos,
    product.image,
    product.image_url,
    product.imageUrl,
  ];

  const result = [];

  for (const source of sources) {
    if (!source) continue;

    let value = parseJson(source);

    // Array
    if (Array.isArray(value)) {
      for (const item of value) {
        const url = extractImageUrl(item);

        if (url && !result.some((img) => img.url === url)) {
          result.push({ url });
        }
      }

      continue;
    }

    // Single image
    const url = extractImageUrl(value);

    if (url && !result.some((img) => img.url === url)) {
      result.push({ url });
    }
  }

  return result;
}

/* ---------------------------------------------
   NORMALIZE PRODUCT
--------------------------------------------- */

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') {
    return product;
  }

  const images = normalizeImages(product);

  return {
    ...product,

    // ProductDetail already expects:
    // product.images[0].url
    images,

    // Also keep a direct image available
    image:
      product.image ||
      product.image_url ||
      product.imageUrl ||
      images[0]?.url ||
      null,
  };
}

/* ---------------------------------------------
   NORMALIZE API RESPONSE
--------------------------------------------- */

function normalizeProductResponse(data) {
  if (!data) return data;

  // Normal response:
  // { success: true, product: {...} }
  if (data.product) {
    return {
      ...data,
      product: normalizeProduct(data.product),
      related: Array.isArray(data.related)
        ? data.related.map(normalizeProduct)
        : data.related,
    };
  }

  // Backend directly returned product object
  if (
    data.id ||
    data.slug ||
    data.name ||
    data.product_id
  ) {
    return normalizeProduct(data);
  }

  return data;
}

/* ---------------------------------------------
   PRODUCT SERVICE
--------------------------------------------- */

export const productService = {
  list: async (params) => {
    const response = await api.get('/products', { params });

    const data = response.data;

    // If API returns { products: [] }
    if (Array.isArray(data?.products)) {
      return {
        ...data,
        products: data.products.map(normalizeProduct),
      };
    }

    // If API directly returns array
    if (Array.isArray(data)) {
      return data.map(normalizeProduct);
    }

    return data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(
      `/products/${encodeURIComponent(slug)}`
    );

    console.log(
      'LUXORA GET PRODUCT API RESPONSE:',
      response.data
    );

    const normalized = normalizeProductResponse(
      response.data
    );

    console.log(
      'LUXORA NORMALIZED PRODUCT:',
      normalized?.product || normalized
    );

    return normalized;
  },
};

/* ---------------------------------------------
   CATEGORY SERVICE
--------------------------------------------- */

export const categoryService = {
  list: async () => {
    const response = await api.get('/categories');

    return response.data;
  },
};  