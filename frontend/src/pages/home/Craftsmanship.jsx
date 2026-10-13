import { useImageReveal } from '../../animations/useScrollAnimations';
import { useStaggerReveal } from '../../animations/useScrollAnimations';
import LuxImage from '../../components/LuxImage';
import SectionHeading from './SectionHeading';
import styles from './Craftsmanship.module.css';

const PILLARS = [
  { title: 'Precision', body: 'Every movement is regulated across multiple positions and temperatures before it earns the Luxora name.' },
  { title: 'Materials', body: '316L surgical steel, sapphire crystal, and full-grain leathers sourced from tanneries we\u2019ve worked with for decades.' },
  { title: 'Movement', body: 'In-house and partner calibers, hand-assembled and finished by watchmakers with an average of 15 years at the bench.' },
  { title: 'Craftsmanship', body: 'From first sketch to final polish, each piece passes through more than 40 pairs of hands.' },
];

export default function Craftsmanship() {
  const imgRef = useImageReveal({ direction: 'bottom' });
  const listRef = useStaggerReveal({ y: 20, stagger: 0.1 });

  return (
    <section className={`container ${styles.section}`}>
      <div className={styles.grid}>
        <div className={styles.imageCol} ref={imgRef}>
          <LuxImage
            src="https://images.unsplash.com/photo-1548171915-e79a380a2a4b?auto=format&fit=crop&w=1200&q=85"
            alt="Watchmaker assembling a Luxora movement"
            aspectRatio="4 / 5"
            className={styles.image}
          />
        </div>
        <div className={styles.textCol}>
          <SectionHeading eyebrow="Our Craft" title="Built by hand, tested by time." />
          <div className={styles.pillars} ref={listRef}>
            {PILLARS.map((p) => (
              <div key={p.title} className={styles.pillar}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
