import { Link } from 'react-router-dom';
import { useStaggerReveal } from '../../animations/useScrollAnimations';
import LuxImage from '../../components/LuxImage';
import SectionHeading from './SectionHeading';
import styles from './CategoriesGrid.module.css';

const CATEGORIES = [
  { name: 'Automatic', slug: 'automatic', img: '1611591437281-460bfbe1220a' },
  { name: 'Chronograph', slug: 'chronograph', img: '1524592094714-0f0654e20314' },
  { name: 'Dress Watches', slug: 'dress-watches', img: '1509048191080-d2984bad6ae5' },
  { name: 'Diver', slug: 'diver', img: '1546868871-7041f2a55e12' },
  { name: 'Sport', slug: 'sport', img: '1434493789847-2f02dc6ca35d' },
  { name: 'Classic', slug: 'classic', img: '1587925358603-c2eea5305bbc' },
  { name: 'Luxury', slug: 'luxury', img: '1622434641406-a158123450f9' },
];

export default function CategoriesGrid() {
  const gridRef = useStaggerReveal({ y: 24, stagger: 0.06 });

  return (
    <section className={`container ${styles.section}`}>
      <SectionHeading eyebrow="Shop by Category" title="Find your movement" align="center" />
      <div className={styles.grid} ref={gridRef}>
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className={styles.card}>
            <LuxImage
              src={`https://images.unsplash.com/photo-${cat.img}?auto=format&fit=crop&w=500&q=80`}
              alt={cat.name}
              aspectRatio="3 / 4"
              className={styles.image}
            />
            <span className={styles.name}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
