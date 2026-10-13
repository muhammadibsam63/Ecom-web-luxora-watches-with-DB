import { Link } from 'react-router-dom';
import { Heart, Star } from './icons';
import LuxImage from './LuxImage';
import { useWishlistStore } from '../context/wishlistStore';
import { useAuthStore } from '../context/authStore';
import { useToast } from './Toast';
import styles from './ProductCard.module.css';
import { formatPKR } from '../utils/currency';

/* =========================================================
   IMAGE NORMALIZER
   Supports:
   - image: "https://..."
   - image: "data:image/..."
   - images: ["https://..."]
   - images: [{ url: "..." }]
   - images: [{ src: "..." }]
   - gallery: [...]
   - JSON string containing an array/object
========================================================= */

function getImageUrl(value) {
  if (!value) return '';

  // Direct string
  if (typeof value === 'string') {
    const valueTrimmed = value.trim();

    if (!valueTrimmed) return '';

    // JSON string
    if (
      (valueTrimmed.startsWith('[') &&
        valueTrimmed.endsWith(']')) ||
      (valueTrimmed.startsWith('{') &&
        valueTrimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(valueTrimmed);
        return getImageUrl(parsed);
      } catch {
        // Not JSON, continue as normal image URL
      }
    }

    return valueTrimmed;
  }

  // Array
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = getImageUrl(item);

      if (url) {
        return url;
      }
    }

    return '';
  }

  // Object
  if (typeof value === 'object') {
    return (
      getImageUrl(value.url) ||
      getImageUrl(value.src) ||
      getImageUrl(value.image) ||
      getImageUrl(value.image_url) ||
      getImageUrl(value.imageUrl) ||
      getImageUrl(value.path) ||
      getImageUrl(value.secure_url) ||
      ''
    );
  }

  return '';
}

/* =========================================================
   GET ALL PRODUCT IMAGES
========================================================= */

function getProductImages(product) {
  if (!product) return [];

  const images = [];

  const addImage = (value) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(addImage);
      return;
    }

    const url = getImageUrl(value);

    if (url && !images.includes(url)) {
      images.push(url);
    }
  };

  // Most common backend fields
  addImage(product.image);
  addImage(product.image_url);
  addImage(product.imageUrl);

  // Image arrays
  addImage(product.images);
  addImage(product.gallery);
  addImage(product.gallery_images);
  addImage(product.product_images);
  addImage(product.photos);

  return images;
}

export default function ProductCard({ product }) {
  const productImages = getProductImages(product);

  const primaryImage = productImages[0] || '';
  const secondaryImage = productImages[1] || '';

  const isWishlisted = useWishlistStore((s) =>
    s.isWishlisted(product.id)
  );

  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const user = useAuthStore((s) => s.user);

  const toast = useToast();

  const rating = Number(product.rating_average) || 0;
  const price = Number(product.price) || 0;
  const stock = Number(product.stock);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Sign in to save items to your wishlist.');
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch (err) {
      toast.error(
        err.message || 'Could not update wishlist.'
      );
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className={styles.card}
    >
      {/* =========================
          PRODUCT IMAGE
      ========================== */}

      <div className={styles.imageWrap}>
        {primaryImage ? (
          <LuxImage
            src={primaryImage}
            alt={product.name || 'Luxora watch'}
            className={styles.imgPrimary}
            aspectRatio="1 / 1"
          />
        ) : (
          <div
            className={styles.imgPlaceholder}
            aria-label="No product image"
          />
        )}

        {secondaryImage && (
          <LuxImage
            src={secondaryImage}
            alt=""
            className={styles.imgSecondary}
            aspectRatio="1 / 1"
          />
        )}

        {/* Wishlist */}
        <button
          type="button"
          className={styles.wishBtn}
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            fill={
              isWishlisted
                ? 'currentColor'
                : 'none'
            }
          />
        </button>

        {/* Sold Out */}
        {stock === 0 && (
          <span className={styles.soldOut}>
            Sold Out
          </span>
        )}
      </div>

      {/* =========================
          PRODUCT INFORMATION
      ========================== */}

      <div className={styles.info}>
        {/* Brand */}
        <span className={styles.brand}>
          {product.brand || 'LUXORA'}
        </span>

        {/* Product Name */}
        <span className={styles.name}>
          {product.name || 'Luxora Watch'}
        </span>

        {/* Price + Rating */}
        <div className={styles.metaRow}>
          <span className={styles.price}>
            {formatPKR(price)}
          </span>

          <span
            className={styles.rating}
            data-empty={!(rating > 0)}
            aria-label={
              rating > 0
                ? `Rated ${rating.toFixed(1)} out of 5`
                : undefined
            }
          >
            {rating > 0 && (
              <>
                <Star
                  size={12}
                  fill="currentColor"
                  strokeWidth={0}
                />
                {rating.toFixed(1)}
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}