import { Star } from '../../components/icons';
import { useStaggerReveal } from '../../animations/useScrollAnimations';
import SectionHeading from './SectionHeading';
import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  { name: 'Adrian M.', role: 'Heritage Automatic owner', quote: 'The finishing on this watch is something I notice every single day. It feels like it was made specifically for me.' },
  { name: 'Sofia R.', role: 'Ocean Diver owner', quote: 'Wore it diving in the Maldives and to a black-tie dinner the same week. It handled both without missing a beat.' },
  { name: 'James K.', role: 'Custom build, Build Your Watch', quote: 'Being able to design my own combination and see it priced in real time made the whole process feel personal.' },
];

export default function Testimonials() {
  const gridRef = useStaggerReveal({ y: 24, stagger: 0.1 });

  return (
    <section className={`container ${styles.section}`}>
      <SectionHeading eyebrow="Testimonials" title="Worn by our collectors" align="center" />
      <div className={styles.grid} ref={gridRef}>
        {TESTIMONIALS.map((t) => (
          <blockquote key={t.name} className={styles.card}>
            <div className={styles.stars}>
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
            </div>
            <p className={styles.quote}>&ldquo;{t.quote}&rdquo;</p>
            <footer className={styles.footer}>
              <span className={styles.name}>{t.name}</span>
              <span className={styles.role}>{t.role}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
