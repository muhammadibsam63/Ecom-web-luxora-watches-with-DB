import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from '../components/icons';
import { useWishlistStore } from '../context/wishlistStore';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import { useToast } from '../components/Toast';
import LuxImage from '../components/LuxImage';
import styles from './Wishlist.module.css';
import { formatPKR } from '../utils/currency';

export default function Wishlist() {
  const items = useWishlistStore((s) => s.items);
  const fetch = useWishlistStore((s) => s.fetch);
  const toggle = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const toast = useToast();

  useEffect(() => { if (user) fetch(); }, [user, fetch]);

  if (!user) {
    return (
      <div className={styles.empty}>
        <Heart size={48} strokeWidth={1} />
        <h1>Sign in to view your wishlist</h1>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <Heart size={48} strokeWidth={1} />
        <h1>Your wishlist is empty</h1>
        <p>Save pieces you love to find them here later.</p>
        <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
      </div>
    );
  }

  const moveToCart = async (item) => {
    try {
      await addItem(item.product_id, 1);
      await toggle(item.product_id);
      toast.success('Moved to bag.');
    } catch (err) {
      toast.error(err.message || 'Could not move to bag.');
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Your Wishlist</h1>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            <button className={styles.remove} onClick={() => toggle(item.product_id)} aria-label="Remove">
              <X size={16} strokeWidth={1.5} />
            </button>
            <Link to={`/product/${item.slug}`}>
              <LuxImage src={item.image} alt={item.name} aspectRatio="1/1" className={styles.img} />
            </Link>
            <div className={styles.info}>
              <span className={styles.brand}>{item.brand}</span>
              <Link to={`/product/${item.slug}`} className={styles.name}>{item.name}</Link>
              <span className={styles.price}>{formatPKR(Number(item.price))}</span>
            </div>
            <button className="btn btn-outline" onClick={() => moveToCart(item)} disabled={item.stock === 0}>
              {item.stock === 0 ? 'Sold Out' : 'Move to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
