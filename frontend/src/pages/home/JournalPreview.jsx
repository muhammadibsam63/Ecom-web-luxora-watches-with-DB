import { Link } from 'react-router-dom';
import { useStaggerReveal } from '../../animations/useScrollAnimations';
import LuxImage from '../../components/LuxImage';
import SectionHeading from './SectionHeading';
import styles from './JournalPreview.module.css';

const ARTICLES = [
  {
    title: 'The Anatomy of a Mechanical Watch',
    excerpt: 'A guided tour through the gears, springs, and jewels that keep time without a battery.',
    slug: 'anatomy-of-a-mechanical-watch',
    img: '1533139502658-0198f920d8e8',
  },
  {
    title: 'Inside the Art of Swiss Watchmaking',
    excerpt: 'How centuries-old technique still shapes the way a modern timepiece is built.',
    slug: 'art-of-swiss-watchmaking',
    img: '1524805444758-089113d48a6d',
  },
  {
    title: 'How to Choose Your First Automatic Watch',
    excerpt: 'A practical guide to movement, materials, and finding a piece that fits your life.',
    slug: 'choosing-your-first-automatic',
    img: '1523170335258-f5ed11844a49',
  },
];

export default function JournalPreview() {
  const gridRef = useStaggerReveal({ y: 26, stagger: 0.1 });

  return (
    <section className={`container ${styles.section}`}>
      <SectionHeading eyebrow="The Journal" title="Notes on horology" />
      <div className={styles.grid} ref={gridRef}>
        {ARTICLES.map((a) => (
          <Link key={a.slug} to={`/journal/${a.slug}`} className={styles.card}>
            <LuxImage
              src={`https://images.unsplash.com/photo-${a.img}?auto=format&fit=crop&w=700&q=80`}
              alt=""
              aspectRatio="4 / 3"
              className={styles.image}
            />
            <h3 className={styles.title}>{a.title}</h3>
            <p className={styles.excerpt}>{a.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
