import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, User as UserIcon } from '../../components/icons';
import { useAuthStore } from '../../context/authStore';
import { useWishlistStore } from '../../context/wishlistStore';
import { orderService } from '../../services/shopServices';
import styles from './AccountOverview.module.css';
import { formatPKR } from '../../utils/currency';

export default function AccountOverview() {
  const user = useAuthStore((s) => s.user);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    orderService.list().then(({ orders }) => setOrders(orders)).catch(() => setOrders([]));
  }, []);

  const recentOrder = orders?.[0];

  return (
    <div>
      <h1 className={styles.title}>Overview</h1>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <Package size={20} strokeWidth={1.5} />
          <span className={styles.statValue}>{orders?.length ?? '—'}</span>
          <span className={styles.statLabel}>Total Orders</span>
        </div>
        <div className={styles.stat}>
          <Heart size={20} strokeWidth={1.5} />
          <span className={styles.statValue}>{wishlistCount}</span>
          <span className={styles.statLabel}>Wishlist Items</span>
        </div>
        <div className={styles.stat}>
          <UserIcon size={20} strokeWidth={1.5} />
          <span className={styles.statValue}>{new Date(user.created_at).getFullYear()}</span>
          <span className={styles.statLabel}>Member Since</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Order</h2>
          <Link to="/account/orders">View All</Link>
        </div>
        {recentOrder ? (
          <Link to={`/account/orders/${recentOrder.id}`} className={styles.orderCard}>
            <div>
              <span className={styles.orderNumber}>{recentOrder.order_number}</span>
              <span className={styles.orderDate}>{new Date(recentOrder.created_at).toLocaleDateString()}</span>
            </div>
            <span className={styles.status} data-status={recentOrder.status}>{recentOrder.status.replace(/_/g, ' ')}</span>
            <span className={styles.orderTotal}>{formatPKR(Number(recentOrder.total))}</span>
          </Link>
        ) : (
          <p className={styles.empty}>No orders yet. <Link to="/shop">Start shopping →</Link></p>
        )}
      </div>

      <div className={styles.section}>
        <h2>Profile Information</h2>
        <div className={styles.profileGrid}>
          <div><span>Name</span><strong>{user.full_name}</strong></div>
          <div><span>Email</span><strong>{user.email}</strong></div>
        </div>
        <Link to="/account/profile" className="btn btn-outline" style={{ width: 'fit-content', marginTop: 16 }}>Edit Profile</Link>
      </div>
    </div>
  );
}
