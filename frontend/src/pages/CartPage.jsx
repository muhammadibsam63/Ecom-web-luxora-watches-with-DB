import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, X } from '../components/icons';
import { useCartStore } from '../context/cartStore';
import LuxImage from '../components/LuxImage';
import styles from './CartPage.module.css';
import { formatPKR } from '../utils/currency';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <ShoppingBag size={48} strokeWidth={1} />
        <h1>Your bag is empty</h1>
        <p>Discover a piece worth the wait.</p>
        <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Your Bag</h1>
      <div className={styles.grid}>
        <div className={styles.items}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <LuxImage src={item.image} alt={item.name} className={styles.img} aspectRatio="1/1" />
              <div className={styles.info}>
                <Link to={`/product/${item.slug}`} className={styles.name}>{item.name}</Link>
                <span className={styles.brand}>{item.brand}</span>
                <span className={styles.price}>{formatPKR(Number(item.price))}</span>
              </div>
              <div className={styles.qty}>
                <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)}><Plus size={14} /></button>
              </div>
              <span className={styles.lineTotal}>{formatPKR((Number(item.price) * item.quantity))}</span>
              <button className={styles.remove} onClick={() => removeItem(item.id)} aria-label="Remove">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>

        <aside className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.row}><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
          <p className={styles.note}>Shipping and taxes calculated at checkout.</p>
          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%' }}>Proceed to Checkout</Link>
        </aside>
      </div>
    </div>
  );
}
