import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
} from '../components/icons';
import { productService } from '../services/productService';
import { reviewService } from '../services/shopServices';
import { formatPKR } from '../utils/currency';
import { useCartStore } from '../context/cartStore';
import { useWishlistStore } from '../context/wishlistStore';
import { useAuthStore } from '../context/authStore';
import { useToast } from '../components/Toast';
import ProductCard from '../components/ProductCard';
import usePageMeta from '../hooks/usePageMeta';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import styles from './ProductDetail.module.css';

const SPEC_FIELDS = [
  ['Movement', 'movement'],
  ['Case Material', 'case_material'],
  ['Case Diameter', 'case_diameter'],
  ['Case Thickness', 'case_thickness'],
  ['Water Resistance', 'water_resistance'],
  ['Strap', 'strap_material'],
  ['Dial', 'dial_color'],
  ['Crystal', 'crystal'],
  ['Power Reserve', 'power_reserve'],
  ['Warranty', 'warranty'],
];

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <rect width="800" height="800" fill="#171717"/>
      <circle cx="400" cy="360" r="125" fill="none" stroke="#bba36a" stroke-width="12"/>
      <circle cx="400" cy="360" r="95" fill="none" stroke="#bba36a" stroke-width="3"/>
      <path d="M400 275 L400 360 L455 390" fill="none" stroke="#bba36a" stroke-width="8" stroke-linecap="round"/>
      <text x="400" y="570" fill="#bba36a" font-family="Arial,sans-serif" font-size="34" text-anchor="middle" letter-spacing="8">LUXORA</text>
      <text x="400" y="615" fill="#999" font-family="Arial,sans-serif" font-size="15" text-anchor="middle" letter-spacing="4">TIME, REFINED.</text>
    </svg>
  `);

function extractImageUrl(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    const str = value.trim();

    if (!str || str === 'null' || str === 'undefined') {
      return '';
    }

    // Handle JSON stored as a string in the database.
    if (
      (str.startsWith('[') && str.endsWith(']')) ||
      (str.startsWith('{') && str.endsWith('}'))
    ) {
      try {
        return extractImageUrl(JSON.parse(str));
      } catch {
        return '';
      }
    }

    return str;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractImageUrl(item);
      if (url) return url;
    }

    return '';
  }

  if (typeof value === 'object') {
    const candidates = [
      value.url,
      value.src,
      value.image_url,
      value.imageUrl,
      value.secure_url,
      value.path,
      value.image,
      value.filename,
      value.file_url,
    ];

    for (const candidate of candidates) {
      const url = extractImageUrl(candidate);
      if (url) return url;
    }
  }

  return '';
}

function normalizeImageUrl(value) {
  const url = extractImageUrl(value);

  if (!url) return '';

  // Preserve absolute URLs and browser-supported data/blob URLs.
  if (
    /^(https?:\/\/|data:image\/|blob:)/i.test(url) ||
    url.startsWith('//')
  ) {
    return url.startsWith('//')
      ? `${window.location.protocol}${url}`
      : url;
  }

  // Normalize Windows-style paths.
  const normalized = url.replace(/\\/g, '/');

  // Convert a saved local upload path to a web path.
  const uploadIndex = normalized.toLowerCase().lastIndexOf('/uploads/');

  if (uploadIndex >= 0) {
    return normalized.slice(uploadIndex);
  }

  if (normalized.toLowerCase().startsWith('uploads/')) {
    return `/${normalized}`;
  }

  // Keep existing root-relative paths unchanged.
  if (normalized.startsWith('/')) {
    return normalized;
  }

  // Handle paths such as images/watch.jpg.
  return `/${normalized}`;
}

function getAllProductImages(product) {
  if (!product) return [];

  const values = [
    product.image,
    product.image_url,
    product.imageUrl,
    product.images,
    product.gallery,
    product.gallery_images,
    product.product_images,
    product.photos,
    product.thumbnail,
    product.featured_image,
    product.main_image,
  ];

  const result = [];

  const add = (value) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }

    const url = normalizeImageUrl(value);

    if (url && !result.includes(url)) {
      result.push(url);
    }
  };

  values.forEach(add);

  return result;
}

function ProductImage({ src, alt, className, aspectRatio }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      className={className}
      src={!src || failed ? PLACEHOLDER_IMAGE : src}
      alt={alt || 'Luxora watch'}
      loading="eager"
      decoding="async"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        aspectRatio: aspectRatio || '1 / 1',
        objectFit: 'contain',
      }}
      onError={() => {
        if (!failed) {
          console.error('LUXORA IMAGE FAILED TO LOAD:', src);
          setFailed(true);
        }
      }}
    />
  );
}

export default function ProductDetail() {
  const { slug } = useParams();

  const [data, setData] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const user = useAuthStore((state) => state.user);

  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const isWishlisted = useWishlistStore((state) =>
    data?.product ? state.isWishlisted(data.product.id) : false
  );

  const toast = useToast();

  useEffect(() => {
    let cancelled = false;

    setData(null);
    setActiveImg(0);
    setQty(1);

    productService
      .getBySlug(slug)
      .then((result) => {
        if (cancelled) return;

        const product = result?.product;

        console.log('LUXORA PRODUCT RESPONSE:', result);
        console.log('LUXORA PRODUCT IMAGE FIELDS:', {
          image: product?.image,
          image_url: product?.image_url,
          imageUrl: product?.imageUrl,
          images: product?.images,
          gallery: product?.gallery,
          gallery_images: product?.gallery_images,
          product_images: product?.product_images,
          photos: product?.photos,
        });

        if (!product) {
          setData(false);
          return;
        }

        setData(result);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error('LUXORA PRODUCT DETAIL ERROR:', error);
        setData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const product = data?.product;

  const images = getAllProductImages(product);

  const seoImage = images[0] || undefined;

  usePageMeta({
    title: product?.name,
    description: product
      ? (product.short_description || product.description || '').slice(0, 155)
      : undefined,
    image: seoImage,
    type: 'product',
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: product.sku,
          brand: {
            '@type': 'Brand',
            name: product.brand || 'LUXORA',
          },
          description: product.description,
          image: images,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'PKR',
            price: Number(product.price),
            availability:
              Number(product.stock) > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url:
              typeof window !== 'undefined'
                ? window.location.href
                : undefined,
          },
          ...(Number(product.rating_count) > 0
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: Number(product.rating_average),
                  reviewCount: Number(product.rating_count),
                },
              }
            : {}),
        }
      : undefined,
  });

  if (data === null) {
    return <ProductDetailSkeleton />;
  }

  if (data === false || !product) {
    return (
      <div className={styles.notFound}>
        <p>We couldn't find that watch.</p>
        <Link to="/shop" className="btn btn-outline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const activeImage = images[activeImg] || images[0] || '';

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Sign in to add items to your bag.');
      return;
    }

    try {
      await addItem(product.id, qty);
      toast.success('Added to bag.');
    } catch (error) {
      toast.error(error.message || 'Could not add to bag.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.info('Sign in to leave a review.');
      return;
    }

    setSubmittingReview(true);

    try {
      await reviewService.create({
        productId: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      toast.success('Thank you for your review.');

      const refreshed = await productService.getBySlug(slug);
      setData(refreshed);

      setReviewForm({
        rating: 5,
        comment: '',
      });
    } catch (error) {
      toast.error(error.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <ProductImage
              src={activeImage}
              alt={product.name || 'Luxora watch'}
              aspectRatio="1 / 1"
            />
          </div>

          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`${styles.thumb} ${
                    activeImg === index ? styles.thumbActive : ''
                  }`}
                  onClick={() => setActiveImg(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name} image ${index + 1}`}
                    aspectRatio="1 / 1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <span className={styles.brand}>
            {product.brand || 'LUXORA'}
          </span>

          <h1 className={styles.name}>
            {product.name || 'Luxora Watch'}
          </h1>

          <div className={styles.ratingRow}>
            <span className={styles.stars}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  strokeWidth={0}
                  fill={
                    index < Math.round(Number(product.rating_average) || 0)
                      ? 'currentColor'
                      : 'var(--color-border-strong)'
                  }
                />
              ))}
            </span>

            <span className={styles.ratingCount}>
              {product.rating_count || 0} reviews
            </span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>
              {formatPKR(product.price)}
            </span>

            {product.compare_price && (
              <span className={styles.comparePrice}>
                {formatPKR(product.compare_price)}
              </span>
            )}
          </div>

          <p className={styles.desc}>{product.description}</p>

          <div className={styles.stockRow}>
            <span
              className={
                Number(product.stock) > 0
                  ? styles.inStock
                  : styles.outStock
              }
            >
              {Number(product.stock) > 0
                ? `In Stock — SKU ${product.sku || 'N/A'}`
                : 'Out of Stock'}
            </span>
          </div>

          <div className={styles.purchaseRow}>
            <div className={styles.qtyPicker}>
              <button
                type="button"
                onClick={() => setQty((quantity) => Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <span>{qty}</span>

              <button
                type="button"
                onClick={() =>
                  setQty((quantity) =>
                    Math.min(
                      Number(product.stock) || quantity + 1,
                      quantity + 1
                    )
                  )
                }
                aria-label="Increase quantity"
                disabled={qty >= Number(product.stock)}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={Number(product.stock) <= 0}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className={styles.wishBtn}
              onClick={() =>
                user
                  ? toggleWishlist(product.id)
                  : toast.info('Sign in to save items.')
              }
              aria-label="Wishlist"
            >
              <Heart
                size={18}
                strokeWidth={1.5}
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          <Link
            to="/checkout"
            className="btn btn-outline"
            style={{ width: '100%' }}
            onClick={handleAddToCart}
          >
            Buy Now
          </Link>

          <div className={styles.perks}>
            <div>
              <Truck size={16} strokeWidth={1.5} />
              Complimentary worldwide shipping
            </div>

            <div>
              <RotateCcw size={16} strokeWidth={1.5} />
              30-day returns
            </div>

            <div>
              <ShieldCheck size={16} strokeWidth={1.5} />
              {product.warranty || '2-Year Warranty'}
            </div>
          </div>

          <div className={styles.specs}>
            <h3>Specifications</h3>

            <dl>
              {SPEC_FIELDS.filter(([, key]) => product[key]).map(
                ([label, key]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{product[key]}</dd>
                  </div>
                )
              )}
            </dl>
          </div>
        </div>
      </div>

      <div className={`container ${styles.reviewsSection}`}>
        <h2 className={styles.sectionTitle}>Customer Reviews</h2>

        <div className={styles.reviewsGrid}>
          <div className={styles.reviewsList}>
            {(data.reviews || []).length === 0 && (
              <p className={styles.noReviews}>
                No reviews yet. Be the first to share your thoughts.
              </p>
            )}

            {(data.reviews || []).map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={12}
                        strokeWidth={0}
                        fill={
                          index < Number(review.rating)
                            ? 'currentColor'
                            : 'var(--color-border-strong)'
                        }
                      />
                    ))}
                  </span>

                  {review.is_verified_purchase && (
                    <span className={styles.verified}>
                      Verified Purchase
                    </span>
                  )}
                </div>

                {review.comment && (
                  <p className={styles.reviewComment}>
                    {review.comment}
                  </p>
                )}

                <span className={styles.reviewMeta}>
                  {review.reviewer_name || 'Customer'} ·{' '}
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString()
                    : ''}
                </span>
              </div>
            ))}
          </div>

          <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
            <h3>Write a Review</h3>

            <div className={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((number) => (
                <button
                  type="button"
                  key={number}
                  onClick={() =>
                    setReviewForm((form) => ({
                      ...form,
                      rating: number,
                    }))
                  }
                  aria-label={`${number} stars`}
                >
                  <Star
                    size={20}
                    strokeWidth={0}
                    fill={
                      number <= reviewForm.rating
                        ? 'var(--color-gold)'
                        : 'var(--color-border-strong)'
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share your experience with this watch…"
              value={reviewForm.comment}
              onChange={(event) =>
                setReviewForm((form) => ({
                  ...form,
                  comment: event.target.value,
                }))
              }
              rows={4}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingReview}
            >
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {(data.related || []).length > 0 && (
        <div className={`container ${styles.related}`}>
          <h2 className={styles.sectionTitle}>You May Also Like</h2>

          <div className={styles.relatedGrid}>
            {data.related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
