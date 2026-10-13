import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, prefersReducedMotion } from '../../animations/gsapConfig';
import { useParallax } from '../../animations/useScrollAnimations';
import LuxImage from '../../components/LuxImage';
import styles from './Hero.module.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=85';

export default function Hero() {
  const rootRef = useRef(null);
  const imageWrapRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const imageParallaxRef = useParallax({ amount: 80 });

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(imageWrapRef.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power3.inOut' })
      .fromTo(eyebrowRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.6')
      .fromTo(headingRef.current.children, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, '-=0.35')
      .fromTo(descRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .fromTo(ctaRef.current.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, '-=0.4');

    return () => tl.kill();
  }, []);

  return (
    <section className={styles.hero} ref={rootRef}>
      <div className={styles.imageWrap} ref={imageWrapRef}>
        <div ref={imageParallaxRef} className={styles.imageInner}>
          <LuxImage src={HERO_IMAGE} alt="Luxora automatic watch on a dark surface" className={styles.image} />
        </div>
        <div className={styles.scrim} />
      </div>

      <div className={`container ${styles.content}`}>
        <span className={styles.eyebrow} ref={eyebrowRef}>The Signature Collection</span>
        <h1 className={styles.heading} ref={headingRef}>
          <span>TIME,</span>
          <span>REFINED.</span>
        </h1>
        <p className={styles.desc} ref={descRef}>
          Precision engineered for those who appreciate every second.
        </p>
        <div className={styles.cta} ref={ctaRef}>
          <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
          <Link to="/build-your-watch" className="btn btn-outline">Build Your Watch</Link>
        </div>
      </div>
    </section>
  );
}
