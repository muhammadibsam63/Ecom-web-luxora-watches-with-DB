import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, prefersReducedMotion } from '../animations/gsapConfig';

export default function PageTransition({ children }) {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <div ref={ref}>{children}</div>;
}
