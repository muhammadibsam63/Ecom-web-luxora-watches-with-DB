import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from './gsapConfig';

/**
 * Animates a numeric value from 0 (or its previous value) up to `value`
 * on mount / whenever `value` changes. Returns a ref to place on the element
 * whose textContent should display the number.
 */
export function useCounterAnimation(value, { duration = 1.2, formatter = (n) => Math.round(n).toLocaleString() } = {}) {
  const ref = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = formatter(value);
      prevValue.current = value;
      return;
    }

    const obj = { val: prevValue.current };
    const anim = gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = formatter(obj.val);
      },
      onComplete: () => {
        prevValue.current = value;
      },
    });

    return () => anim.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return ref;
}
