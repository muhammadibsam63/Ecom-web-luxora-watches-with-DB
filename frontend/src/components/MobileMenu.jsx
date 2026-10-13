import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from './icons';
import { gsap, prefersReducedMotion } from '../animations/gsapConfig';
import { useAuthStore } from '../context/authStore';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ open, onClose, links }) {
  const rootRef = useRef(null);
  const linksRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const root = rootRef.current;
    const linkEls = linksRef.current?.children;
    if (!root) return;

    if (prefersReducedMotion()) {
      gsap.set(root, { display: open ? 'flex' : 'none', opacity: open ? 1 : 0 });
      return;
    }

    if (open) {
      document.body.style.overflow = 'hidden';
      gsap.set(root, { display: 'flex' });
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      if (linkEls?.length) {
        gsap.fromTo(
          linkEls,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, delay: 0.1, ease: 'power3.out' }
        );
      }
    } else {
      document.body.style.overflow = '';
      gsap.to(root, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => gsap.set(root, { display: 'none' }),
      });
    }
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef} role="dialog" aria-modal="true" aria-label="Menu">
      <div className={`container ${styles.top}`}>
        <span className={styles.logo}>LUXORA</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

      <nav className={styles.links} ref={linksRef}>
        {links.map((link) => (
          <Link key={link.label} to={link.to} onClick={onClose} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link to={user ? '/account' : '/login'} onClick={onClose} className="btn btn-outline">
          {user ? 'My Account' : 'Sign In'}
        </Link>
      </div>
    </div>
  );
}
