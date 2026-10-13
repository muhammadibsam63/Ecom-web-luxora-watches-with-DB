import { useEffect } from 'react';
import { X } from '../../components/icons';
import { gsap, prefersReducedMotion } from '../../animations/gsapConfig';
import styles from './Modal.module.css';

export default function Modal({ open, onClose, title, children, width = 520 }) {
  useEffect(() => {
    if (!open) return;
    if (!prefersReducedMotion()) {
      gsap.fromTo(`.${styles.panel}`, { opacity: 0, y: 12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
    }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label={title}>
      <button className={styles.backdrop} onClick={onClose} aria-label="Close" />
      <div className={styles.panel} style={{ maxWidth: width }}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close"><X size={18} strokeWidth={1.5} /></button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
