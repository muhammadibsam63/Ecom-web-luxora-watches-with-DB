import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/productService';
import LuxImage from '../components/LuxImage';
import { useStaggerReveal } from '../animations/useScrollAnimations';
import styles from './Collections.module.css';
import usePageMeta from '../hooks/usePageMeta';

const CATEGORY_IMAGES = {
  automatic: '1611591437281-460bfbe1220a',
  chronograph: '1524592094714-0f0654e20314',
  'dress-watches': '1509048191080-d2984bad6ae5',
  diver: '1546868871-7041f2a55e12',
  sport: '1434493789847-2f02dc6ca35d',
  classic: '1587925358603-c2eea5305bbc',
  luxury: '1622434641406-a158123450f9',
};

export default function Collections() {
  usePageMeta({ title: 'Collections', description: 'Explore Luxora watch collections, each defined by movement and purpose.' });
  const [categories, setCategories] = useState(null);
  const gridRef = useStaggerReveal({ y: 30, stagger: 0.08 });

  useEffect(() => {
    categoryService.list().then(({ categories }) => setCategories(categories)).catch(() => setCategories([]));
  }, []);

  return (
    <div className={styles.page}>
      <div className={`container ${styles.header}`}>
        <span className="eyebrow">Collections</span>
        <h1>Defined by movement, made for you.</h1>
        <p>Every Luxora collection is built around a single idea — from the quiet confidence of a dress watch to the readiness of a professional diver.</p>
      </div>

      <div className={`container ${styles.grid}`} ref={gridRef}>
        {categories?.map((cat) => (
          <Link key={cat.id} to={`/shop?category=${cat.slug}`} className={styles.card}>
            <LuxImage
              src={`https://images.unsplash.com/photo-${CATEGORY_IMAGES[cat.slug] || '1523170335258-f5ed11844a49'}?auto=format&fit=crop&w=900&q=85`}
              alt={cat.name}
              aspectRatio="4 / 5"
              className={styles.image}
            />
            <div className={styles.overlay}>
              <h2>{cat.name}</h2>
              <p>{cat.description}</p>
              <span className={styles.count}>{cat.product_count} pieces →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
