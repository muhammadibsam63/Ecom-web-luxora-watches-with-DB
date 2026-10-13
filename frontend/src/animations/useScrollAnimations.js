import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE, DURATION, prefersReducedMotion } from './gsapConfig';

/**
 * Fades + slides a single element into view as it enters the viewport.
 * Usage: const ref = useScrollReveal(); <div ref={ref} />
 */
export function useScrollReveal({ y = 32, delay = 0, start = 'top 85%' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(el, { opacity: 0, y });
    const anim = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: DURATION.slow,
      delay,
      ease: EASE.smooth,
      scrollTrigger: { trigger: el, start },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

/**
 * Staggers the direct children of a container element into view — used for
 * product grids, nav links, and typography reveals.
 */
export function useStaggerReveal({ y = 24, stagger = 0.08, start = 'top 85%', selector } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = selector ? el.querySelectorAll(selector) : el.children;
    if (!targets.length) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(targets, { opacity: 0, y });
    const anim = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: DURATION.medium,
      stagger,
      ease: EASE.smooth,
      scrollTrigger: { trigger: el, start },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);

  return ref;
}

/**
 * Reveals an image with a clip-path wipe rather than a plain fade —
 * used for hero and editorial photography.
 */
export function useImageReveal({ direction = 'left', delay = 0, start = 'top 80%' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { clipPath: 'inset(0 0 0 0)' });
      return;
    }

    const clipFrom = {
      left: 'inset(0 100% 0 0)',
      right: 'inset(0 0 0 100%)',
      bottom: 'inset(100% 0 0 0)',
      top: 'inset(0 0 100% 0)',
    }[direction];

    gsap.set(el, { clipPath: clipFrom });
    const anim = gsap.to(el, {
      clipPath: 'inset(0 0 0 0)',
      duration: DURATION.reveal,
      delay,
      ease: EASE.luxury,
      scrollTrigger: { trigger: el, start },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction]);

  return ref;
}

/**
 * Subtle parallax on scroll — moves an element a fraction of the scroll
 * distance for depth, used on hero/editorial imagery. Keep amount small.
 */
export function useParallax({ amount = 60 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const anim = gsap.to(el, {
      y: amount,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  return ref;
}

export { gsap, ScrollTrigger };
