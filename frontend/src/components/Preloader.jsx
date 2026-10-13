import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../animations/gsapConfig';
import styles from './Preloader.module.css';

export default function Preloader({ onComplete }) {
  const rootRef = useRef(null);
  const lineRef = useRef(null);
  const countRef = useRef(null);
  const logoRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setHidden(true);
      onComplete?.();
      return;
    }

    const counter = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setHidden(true);
        onComplete?.();
      },
    });

    tl.set(rootRef.current, { display: 'flex' })
      .from(logoRef.current, { opacity: 0, y: 12, duration: 0.6, ease: 'power2.out' })
      .to(
        lineRef.current,
        { scaleX: 1, duration: 1.3, ease: 'power2.inOut' },
        '-=0.2'
      )
      .to(
        counter,
        {
          val: 100,
          duration: 1.3,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(counter.val)).padStart(3, '0');
          },
        },
        '<'
      )
      .to(rootRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut', delay: 0.15 })
      .set(rootRef.current, { display: 'none' });

    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  return (
    <div className={styles.root} ref={rootRef} role="status" aria-label="Loading Luxora Watches">
      <div className={styles.center}>
        <div className={styles.logo} ref={logoRef}>
          <span className={styles.logoLine}>LUXORA</span>
          <span className={styles.logoLineSmall}>WATCHES</span>
        </div>
        <div className={styles.lineTrack}>
          <div className={styles.lineFill} ref={lineRef} />
        </div>
        <div className={styles.count}>
          <span ref={countRef}>000</span>
          <span className={styles.percent}>%</span>
        </div>
      </div>
    </div>
  );
}
