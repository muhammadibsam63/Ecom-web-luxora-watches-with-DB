import { Link } from 'react-router-dom';
import { useStaggerReveal } from '../animations/useScrollAnimations';
import LuxImage from '../components/LuxImage';
import styles from './Journal.module.css';
import usePageMeta from '../hooks/usePageMeta';

const ARTICLES = [
  {
    title: 'The Anatomy of a Mechanical Watch',
    excerpt: 'A guided tour through the gears, springs, and jewels that keep time without a battery — and why that still matters in an age of quartz.',
    slug: 'anatomy-of-a-mechanical-watch',
    img: '1533139502658-0198f920d8e8',
    date: 'March 2026',
  },
  {
    title: 'Inside the Art of Swiss Watchmaking',
    excerpt: 'How centuries-old technique still shapes the way a modern timepiece is built, from rough movement to finished dial.',
    slug: 'art-of-swiss-watchmaking',
    img: '1524805444758-089113d48a6d',
    date: 'February 2026',
  },
  {
    title: 'How to Choose Your First Automatic Watch',
    excerpt: 'A practical guide to movement, materials, and finding a piece that actually fits the life you live.',
    slug: 'choosing-your-first-automatic',
    img: '1523170335258-f5ed11844a49',
    date: 'January 2026',
  },
  {
    title: 'Water Resistance, Explained',
    excerpt: 'What those meter ratings actually mean, and which watch is right for the pool, the ocean, or neither.',
    slug: 'water-resistance-explained',
    img: '1546868871-7041f2a55e12',
    date: 'December 2025',
  },
];

export default function Journal() {
  usePageMeta({ title: 'The Journal', description: 'Notes on horology — watchmaking, materials and buying guides from Luxora.' });
  const gridRef = useStaggerReveal({ y: 28, stagger: 0.08 });

  return (
    <div className={styles.page}>
      <div className={`container ${styles.header}`}>
        <span className="eyebrow">The Journal</span>
        <h1>Notes on horology.</h1>
      </div>

      <div className={`container ${styles.grid}`} ref={gridRef}>
        {ARTICLES.map((a) => (
          <Link key={a.slug} to={`/journal/${a.slug}`} className={styles.card}>
            <LuxImage src={`https://images.unsplash.com/photo-${a.img}?auto=format&fit=crop&w=800&q=80`} alt="" aspectRatio="16/10" className={styles.image} />
            <span className={styles.date}>{a.date}</span>
            <h2 className={styles.title}>{a.title}</h2>
            <p className={styles.excerpt}>{a.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
