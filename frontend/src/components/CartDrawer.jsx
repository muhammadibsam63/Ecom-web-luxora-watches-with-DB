import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from './icons';
import { gsap, prefersReducedMotion } from '../animations/gsapConfig';
import { useCartStore } from '../context/cartStore';
import styles from './CartDrawer.module.css';
import { formatPKR } from '../utils/currency';

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);

  const rootRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    if (prefersReducedMotion()) {
      gsap.set(root, { display: isOpen ? 'block' : 'none' });
      gsap.set(panel, { x: isOpen ? 0 : '100%' });
      return;
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.set(root, { display: 'block' });
      gsap.fromTo(`.${styles.backdrop}`, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(panel, { x: '100%' }, { x: 0, duration: 0.5, ease: 'power3.out' });
    } else {
      document.body.style.overflow = '';
      gsap.to(panel, { x: '100%', duration: 0.4, ease: 'power2.in' });
      gsap.to(`.${styles.backdrop}`, {
        opacity: 0, duration: 0.3,
        onComplete: () => gsap.set(root, { display: 'none' }),
      });
    }
  }, [isOpen]);

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <div className={styles.root} ref={rootRef} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button className={styles.backdrop} onClick={closeCart} aria-label="Close cart" />
      <aside className={styles.panel} ref={panelRef}>
        <header className={styles.header}>
          <h2 className={styles.title}>Your Bag {items.length > 0 && `(${items.length})`}</h2>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={40} strokeWidth={1} />
            <p>Your bag is empty.</p>
            <Link to="/shop" onClick={closeCart} className="btn btn-outline">Explore Collection</Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <img src={item.image} alt="" className={styles.itemImg} loading="lazy" />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemBrand}>{item.brand}</span>
                    <div className={styles.qtyRow}>
                      <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity">
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>{formatPKR((Number(item.price) * item.quantity))}</span>
                    <button className={styles.remove} onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <footer className={styles.footer}>
              <div className={styles.row}>
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              <p className={styles.note}>Shipping and taxes calculated at checkout.</p>
              <div className={styles.actions}>
                <Link to="/cart" onClick={closeCart} className="btn btn-outline">View Cart</Link>
                <Link to="/checkout" onClick={closeCart} className="btn btn-primary">Checkout</Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
