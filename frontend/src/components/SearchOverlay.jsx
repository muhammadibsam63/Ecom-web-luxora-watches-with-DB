import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from './icons';
import { gsap, prefersReducedMotion } from '../animations/gsapConfig';
import { productService } from '../services/productService';
import { formatPKR } from '../utils/currency';
import styles from './SearchOverlay.module.css';

const RECENT_KEY = 'luxora-recent-searches';
const POPULAR = ['Automatic', 'Chronograph', 'Diver', 'Dress Watches', 'Luxury'];

export default function SearchOverlay({ open, onClose }) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      gsap.set(root, { display: open ? 'flex' : 'none', opacity: open ? 1 : 0 });
      if (open) setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    if (open) {
      gsap.set(root, { display: 'flex' });
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(
        `.${styles.panel}`,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.05 }
      );
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      gsap.to(root, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => gsap.set(root, { display: 'none' }),
      });
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const { products } = await productService.list({ search: query, limit: 6 });
        setResults(products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const commitSearch = useCallback((term) => {
    if (!term.trim()) return;
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    onClose();
    setQuery('');
  }, [recent, navigate, onClose]);

  return (
    <div className={styles.root} ref={rootRef} role="dialog" aria-modal="true" aria-label="Search">
      <button className={styles.backdrop} onClick={onClose} aria-label="Close search" />
      <div className={styles.panel}>
        <div className={`container ${styles.inputRow}`}>
          <Search size={20} strokeWidth={1.5} className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search for watches, collections, materials…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitSearch(query)}
          />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className={`container ${styles.body}`}>
          {query.trim() ? (
            <div className={styles.results}>
              {loading && <p className={styles.hint}>Searching…</p>}
              {!loading && results.length === 0 && <p className={styles.hint}>No results for "{query}".</p>}
              {results.map((p) => (
                <button
                  key={p.id}
                  className={styles.resultRow}
                  onClick={() => { navigate(`/product/${p.slug}`); onClose(); setQuery(''); }}
                >
                  <img src={p.images?.[0]?.url} alt="" className={styles.resultImg} loading="lazy" />
                  <span>
                    <span className={styles.resultName}>{p.name}</span>
                    <span className={styles.resultBrand}>{p.brand}</span>
                  </span>
                  <span className={styles.resultPrice}>{formatPKR(p.price)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.suggestions}>
              {recent.length > 0 && (
                <div className={styles.group}>
                  <span className={styles.groupLabel}>Recent</span>
                  <div className={styles.chips}>
                    {recent.map((r) => (
                      <button key={r} className={styles.chip} onClick={() => commitSearch(r)}>{r}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.group}>
                <span className={styles.groupLabel}>Popular</span>
                <div className={styles.chips}>
                  {POPULAR.map((p) => (
                    <button key={p} className={styles.chip} onClick={() => commitSearch(p)}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
