import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShoppingCart, Boxes, Users, Layers } from '../../components/icons';
import { gsap, prefersReducedMotion } from '../../animations/gsapConfig';
import { adminSearchService } from '../../services/adminServices';
import styles from './AdminCommandPalette.module.css';

const QUICK_ACTIONS = [
  { label: 'Add Product', icon: Plus, to: '/admin/products' },
  { label: 'View Orders', icon: ShoppingCart, to: '/admin/orders' },
  { label: 'Manage Inventory', icon: Boxes, to: '/admin/inventory' },
  { label: 'View Customers', icon: Users, to: '/admin/users' },
  { label: 'Create Collection', icon: Layers, to: '/admin/collections' },
];

export default function AdminCommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) {
      gsap.set(root, { display: open ? 'flex' : 'none' });
      if (open) setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    if (open) {
      gsap.set(root, { display: 'flex' });
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(`.${styles.panel}`, { opacity: 0, y: -12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      gsap.to(root, { opacity: 0, duration: 0.15, onComplete: () => gsap.set(root, { display: 'none' }) });
      setQuery('');
      setResults(null);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    const t = setTimeout(async () => {
      try {
        const { results } = await adminSearchService.search(query);
        setResults(results);
      } catch { setResults(null); }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const go = (to) => { navigate(to); onClose(); };

  const flatResults = results ? [
    ...results.products.map((p) => ({ label: p.name, sub: p.sku, to: `/admin/products` })),
    ...results.orders.map((o) => ({ label: o.order_number, sub: o.customer_name, to: `/admin/orders` })),
    ...results.customers.map((c) => ({ label: c.full_name, sub: c.email, to: `/admin/users` })),
    ...results.categories.map((c) => ({ label: c.name, sub: 'Category', to: `/admin/categories` })),
  ] : [];

  return (
    <div className={styles.root} ref={rootRef} role="dialog" aria-modal="true" aria-label="Quick actions and search">
      <button className={styles.backdrop} onClick={onClose} aria-label="Close" />
      <div className={styles.panel}>
        <div className={styles.inputRow}>
          <Search size={18} strokeWidth={1.5} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, orders, customers… or jump to a page" className={styles.input} />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        <div className={styles.body}>
          {!query.trim() ? (
            <>
              <span className={styles.groupLabel}>Quick Actions</span>
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} className={styles.row} onClick={() => go(a.to)}>
                  <a.icon size={16} strokeWidth={1.5} />
                  <span>{a.label}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <span className={styles.groupLabel}>Results</span>
              {flatResults.length === 0 && <p className={styles.hint}>No matches for "{query}".</p>}
              {flatResults.map((r, i) => (
                <button key={i} className={styles.row} onClick={() => go(r.to)}>
                  <Search size={14} strokeWidth={1.5} />
                  <span>{r.label}</span>
                  <span className={styles.sub}>{r.sub}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
