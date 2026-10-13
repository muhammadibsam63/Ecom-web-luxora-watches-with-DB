import { useEffect, useMemo, useState } from 'react';
import { useStaggerReveal } from '../animations/useScrollAnimations';
import { productService } from '../services/productService';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import { useToast } from '../components/Toast';
import styles from './BuildYourWatch.module.css';
import { formatPKR } from '../utils/currency';

const OPTIONS = {
  case: [
    { id: 'steel', label: 'Stainless Steel', price: 0, hex: '#c7c9cc' },
    { id: 'gold', label: '18K Rose Gold', price: 240000, hex: '#c7b58a' },
    { id: 'titanium', label: 'Titanium', price: 85000, hex: '#8e9296' },
  ],
  dial: [
    { id: 'black', label: 'Midnight Black', price: 0, hex: '#161513' },
    { id: 'blue', label: 'Ocean Blue', price: 10000, hex: '#274a6b' },
    { id: 'white', label: 'Ivory White', price: 10000, hex: '#eee9dd' },
    { id: 'green', label: 'Forest Green', price: 13000, hex: '#3a4f3c' },
  ],
  hands: [
    { id: 'gold-hands', label: 'Gold', price: 0 },
    { id: 'steel-hands', label: 'Steel', price: 0 },
  ],
  strap: [
    { id: 'leather', label: 'Italian Leather', price: 0, hex: '#4a3324' },
    { id: 'steel-bracelet', label: 'Steel Bracelet', price: 42000, hex: '#c7c9cc' },
    { id: 'rubber', label: 'Rubber Sport', price: 16000, hex: '#1c1c1c' },
    { id: 'mesh', label: 'Milanese Mesh', price: 34000, hex: '#a9abae' },
  ],
  buckle: [
    { id: 'pin', label: 'Pin Buckle', price: 0 },
    { id: 'deployant', label: 'Deployant Clasp', price: 24000 },
  ],
};

const BASE_PRICE = 260000;

export default function BuildYourWatch() {
  const [selection, setSelection] = useState({
    case: 'steel', dial: 'black', hands: 'gold-hands', strap: 'leather', buckle: 'pin',
  });
  const [baseProduct, setBaseProduct] = useState(null);
  const [adding, setAdding] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const panelRef = useStaggerReveal({ y: 20, stagger: 0.06 });

  useEffect(() => {
    productService.list({ sort: 'featured', limit: 1 }).then(({ products }) => setBaseProduct(products[0])).catch(() => {});
  }, []);

  const totalPrice = useMemo(() => {
    return Object.entries(selection).reduce((sum, [group, id]) => {
      const opt = OPTIONS[group].find((o) => o.id === id);
      return sum + (opt?.price || 0);
    }, BASE_PRICE);
  }, [selection]);

  const dialHex = OPTIONS.dial.find((o) => o.id === selection.dial)?.hex;
  const caseHex = OPTIONS.case.find((o) => o.id === selection.case)?.hex;
  const strapHex = OPTIONS.strap.find((o) => o.id === selection.strap)?.hex;
  const handColor = selection.hands === 'gold-hands' ? '#c7b58a' : '#e5e5e5';

  const handleAddToCart = async () => {
    if (!user) return toast.info('Sign in to add your build to the bag.');
    if (!baseProduct) return;
    setAdding(true);
    try {
      await addItem(baseProduct.id, 1, { ...selection, customPrice: totalPrice, type: 'build-your-watch' });
      toast.success('Your custom build has been added to the bag.');
    } catch (err) {
      toast.error(err.message || 'Could not add your build to the bag.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.header}`}>
        <span className="eyebrow">Build Your Watch</span>
        <h1>Design a piece that's entirely yours.</h1>
        <p>Choose every detail — from case material to clasp — and see your watch take shape in real time.</p>
      </div>

      <div className={`container ${styles.layout}`}>
        <div className={styles.preview}>
          <svg viewBox="0 0 320 320" className={styles.watchSvg}>
            <circle cx="160" cy="160" r="130" fill={caseHex} />
            <circle cx="160" cy="160" r="112" fill={dialHex} stroke={caseHex} strokeWidth="4" />
            <line x1="160" y1="160" x2="160" y2="95" stroke={handColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="160" y1="160" x2="205" y2="175" stroke={handColor} strokeWidth="4" strokeLinecap="round" />
            <circle cx="160" cy="160" r="6" fill={handColor} />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 160 + Math.sin(angle) * 100;
              const y1 = 160 - Math.cos(angle) * 100;
              const x2 = 160 + Math.sin(angle) * 90;
              const y2 = 160 - Math.cos(angle) * 90;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={handColor} strokeWidth="2.5" opacity="0.8" />;
            })}
            <rect x="130" y="285" width="60" height="24" rx="4" fill={strapHex} />
            <rect x="130" y="11" width="60" height="24" rx="4" fill={strapHex} />
          </svg>
          <p className={styles.previewNote}>Illustrative preview — your finished piece is hand-assembled to these exact specifications.</p>
        </div>

        <div className={styles.panel} ref={panelRef}>
          {Object.entries(OPTIONS).map(([group, opts]) => (
            <div key={group} className={styles.group}>
              <span className={styles.groupLabel}>{group}</span>
              <div className={styles.optionsRow}>
                {opts.map((opt) => (
                  <button
                    key={opt.id}
                    className={styles.option}
                    data-active={selection[group] === opt.id}
                    onClick={() => setSelection((s) => ({ ...s, [group]: opt.id }))}
                  >
                    {opt.hex && <span className={styles.swatch} style={{ background: opt.hex }} />}
                    <span>{opt.label}</span>
                    {opt.price > 0 && <span className={styles.optPrice}>+{formatPKR(opt.price)}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.priceRow}>
            <span>Total</span>
            <span className={styles.total}>{formatPKR(totalPrice)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddToCart} disabled={adding || !baseProduct}>
            {adding ? 'Adding…' : 'Add Custom Watch to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
