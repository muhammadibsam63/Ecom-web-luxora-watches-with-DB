import { useImageReveal, useScrollReveal } from '../animations/useScrollAnimations';
import LuxImage from '../components/LuxImage';
import styles from './About.module.css';
import usePageMeta from '../hooks/usePageMeta';

export default function About() {
  usePageMeta({ title: 'Our Story', description: 'The story, craftsmanship and philosophy behind Luxora Watches.' });
  const heroImgRef = useImageReveal({ direction: 'bottom' });
  const textRef = useScrollReveal({ y: 24 });
  const craftImgRef = useImageReveal({ direction: 'left' });

  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <span className="eyebrow">Our Story</span>
        <h1>A house built on restraint.</h1>
        <p className={styles.lead}>
          Luxora was founded on a simple belief: that a watch should say everything by saying very little.
          No unnecessary complications, no fleeting trends — just precision, proportion, and materials built to outlast us.
        </p>
      </section>

      <div className={styles.heroImage} ref={heroImgRef}>
        <LuxImage
          src="https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?auto=format&fit=crop&w=1800&q=85"
          alt="Luxora watches displayed on a dark surface"
          className={styles.heroImg}
        />
      </div>

      <section id="craftsmanship" className={`container ${styles.split}`}>
        <div className={styles.splitImg} ref={craftImgRef}>
          <LuxImage
            src="https://images.unsplash.com/photo-1548171915-e79a380a2a4b?auto=format&fit=crop&w=1000&q=85"
            alt="Watchmaker at the bench"
            aspectRatio="4/5"
            className={styles.image}
          />
        </div>
        <div className={styles.splitText} ref={textRef}>
          <span className="eyebrow">Craftsmanship</span>
          <h2>Every piece passes through more than 40 hands.</h2>
          <p>
            From the first sketch to the final polish, a Luxora watch moves through the hands of watchmakers,
            engravers, and quality inspectors — each trained for years in a single discipline. We build slowly,
            on purpose, because the alternative isn't a Luxora watch at all.
          </p>
          <p>
            Our workshop sources 316L surgical steel, sapphire crystal, and full-grain leathers from partners
            we've worked with for decades — not because it's expected of a luxury brand, but because nothing
            else meets the standard we hold ourselves to.
          </p>
        </div>
      </section>

      <section className={`container ${styles.values}`}>
        {[
          { title: 'Precision', body: 'Every movement is regulated across multiple positions before it earns the Luxora name.' },
          { title: 'Integrity', body: 'No inflated pricing, no manufactured scarcity — just honest value in every piece.' },
          { title: 'Longevity', body: 'Built to be worn daily, repaired when needed, and passed down when the time comes.' },
        ].map((v) => (
          <div key={v.title} className={styles.valueCard}>
            <h3>{v.title}</h3>
            <p>{v.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
