import { useParallax, useScrollReveal } from '../../animations/useScrollAnimations';
import LuxImage from '../../components/LuxImage';
import styles from './ArtOfTime.module.css';

export default function ArtOfTime() {
  const parallaxRef = useParallax({ amount: 70 });
  const textRef = useScrollReveal({ y: 24 });

  return (
    <section className={styles.section}>
      <div className={styles.imageWrap}>
        <div ref={parallaxRef} className={styles.imageInner}>
          <LuxImage
            src="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=1800&q=85"
            alt="Close-up detail of a Luxora watch movement"
            className={styles.image}
          />
        </div>
        <div className={styles.scrim} />
      </div>
      <div className={`container ${styles.content}`} ref={textRef}>
        <span className={styles.eyebrow}>The Art of Time</span>
        <h2 className={styles.heading}>Every second, considered.</h2>
        <p className={styles.desc}>
          A Luxora watch is not measured in features, but in the quiet confidence of something made to last —
          worn daily, passed down, and rarely explained.
        </p>
      </div>
    </section>
  );
}
