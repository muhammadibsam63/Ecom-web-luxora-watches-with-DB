import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Shared motion tokens — keep every animation in the app consistent.
export const EASE = {
  luxury: 'cubic-bezier(0.16, 1, 0.3, 1)', // gsap accepts CSS cubic-bezier strings
  standard: 'power2.out',
  smooth: 'power3.out',
};

export const DURATION = {
  fast: 0.2,
  medium: 0.45,
  slow: 0.9,
  reveal: 1.1,
};

export function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
