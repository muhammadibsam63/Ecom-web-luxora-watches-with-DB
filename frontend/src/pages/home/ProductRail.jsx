
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import ProductGridSkeleton from '../../components/ProductGridSkeleton';
import { useStaggerReveal } from '../../animations/useScrollAnimations';
import SectionHeading from './SectionHeading';
import styles from './ProductRail.module.css';

export default function ProductRail({
  eyebrow,
  title,
  description,
  query,
  viewAllHref,
  limit = 4,
}) {
  const [products, setProducts] = useState(null);
  const gridRef = useStaggerReveal({ y: 30, stagger: 0.08 });

  useEffect(() => {
    let active = true;

    productService
      .list({ ...query, limit })
      .then((response) => {
        if (!active) return;

        // Handle common API response formats.
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
        console.error('Product rail failed to load:', error);

        if (active) {
          setProducts([]);
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={`container ${styles.section}`}>
      <div className={styles.header}>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {viewAllHref && (
          <Link to={viewAllHref} className={styles.viewAll}>
            View All →
          </Link>
        )}
      </div>

      {products === null ? (
        <ProductGridSkeleton count={limit} />
      ) : products.length === 0 ? (
        <p className={styles.empty}>No products available yet.</p>
      ) : (
        <div className={styles.grid} ref={gridRef}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}