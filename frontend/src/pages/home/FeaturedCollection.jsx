
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  useImageReveal,
  useScrollReveal,
} from '../../animations/useScrollAnimations';
import { productService } from '../../services/productService';
import LuxImage from '../../components/LuxImage';
import SectionHeading from './SectionHeading';
import styles from './FeaturedCollection.module.css';
import { formatPKR } from '../../utils/currency';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85';

export default function FeaturedCollection() {
  const [products, setProducts] = useState([]);
  const imgRef = useImageReveal({ direction: 'left' });
  const textRef = useScrollReveal({ y: 24, delay: 0.15 });

  useEffect(() => {
    let active = true;

    productService
      .list({ sort: 'featured', limit: 1 })
      .then((response) => {
        if (!active) return;

        // Support common API response formats safely.
        const data = response?.data ?? response;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : Array.isArray(data?.data?.products)
              ? data.data.products
              : [];

        setProducts(items);
      })
      .catch((error) => {
        console.error('Featured collection failed to load:', error);
        if (active) setProducts([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const featured = products[0];

  const image =
    (typeof featured?.images?.[0] === 'string'
      ? featured.images[0]
      : featured?.images?.[0]?.url) ||
    featured?.image_url ||
    featured?.image ||
    FALLBACK_IMAGE;

  return (
    <section className={`container ${styles.section}`}>
      <SectionHeading
        eyebrow="Featured Collection"
        title="The Heritage Line"
      />

      <div className={styles.grid}>
        <div className={styles.imageCol} ref={imgRef}>
          <LuxImage
            src={image}
            alt={featured?.name || 'Featured Luxora watch'}
            aspectRatio="4 / 5"
            className={styles.image}
          />
        </div>

        <div className={styles.textCol} ref={textRef}>
          <span className={styles.kicker}>
            {featured?.category_name || 'Automatic'}
          </span>

          <h3 className={styles.name}>
            {featured?.name || 'Luxora Heritage Automatic'}
          </h3>

          <p className={styles.desc}>
            {featured?.description ||
              'A tribute to classic horology, pairing a hand-finished movement with timeless proportions.'}
          </p>

          <div className={styles.specs}>
            <div>
              <span>Movement</span>
              <strong>{featured?.movement || 'Automatic'}</strong>
            </div>

            <div>
              <span>Case</span>
              <strong>
                {featured?.case_material || '316L Stainless Steel'}
              </strong>
            </div>

            <div>
              <span>Water Resistance</span>
              <strong>{featured?.water_resistance || '100m'}</strong>
            </div>
          </div>

          {featured && featured.price != null && (
            <span className={styles.price}>
              {formatPKR(Number(featured.price))}
            </span>
          )}

          <Link
            to={featured?.slug ? `/product/${featured.slug}` : '/shop'}
            className="btn btn-primary"
            style={{ width: 'fit-content', marginTop: 8 }}
          >
            Discover the Piece
          </Link>
        </div>
      </div>
    </section>
  );
}