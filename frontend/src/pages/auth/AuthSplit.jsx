import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, prefersReducedMotion } from '../../animations/gsapConfig';
import LuxImage from '../../components/LuxImage';
import styles from './AuthSplit.module.css';

export default function AuthSplit({ image, eyebrow, title, subtitle, children }) {
  const formRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(imgRef.current, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.1, ease: 'power3.inOut' });
    gsap.fromTo(formRef.current.children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.3, ease: 'power2.out' });
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.visual} ref={imgRef}>
        <LuxImage src={image} alt="" className={styles.image} />
        <div className={styles.scrim} />
        <Link to="/" className={styles.logo}>
          <span>LUXORA</span>
          <span className={styles.logoSub}>WATCHES</span>
        </Link>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formInner} ref={formRef}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
