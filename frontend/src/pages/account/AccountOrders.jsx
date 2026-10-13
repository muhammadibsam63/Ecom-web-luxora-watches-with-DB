import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from '../../components/icons';
import { orderService } from '../../services/shopServices';
import styles from './AccountOverview.module.css';
import { formatPKR } from '../../utils/currency';

export default function AccountOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    orderService.list().then(({ orders }) => setOrders(orders)).catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <h1 className={styles.title}>Orders</h1>

      {orders === null ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.orderCard} style={{ pointerEvents: 'none' }}>
              <div>
                <div className="skeleton" style={{ height: 13, width: 140, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: 180 }} />
              </div>
              <div className="skeleton" style={{ height: 22, width: 90, borderRadius: 20 }} />
              <div className="skeleton" style={{ height: 14, width: 80 }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
          <Package size={36} strokeWidth={1} />
          <p className={styles.empty}>No orders yet. <Link to="/shop">Start shopping →</Link></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((o) => (
            <Link key={o.id} to={`/account/orders/${o.id}`} className={styles.orderCard}>
              <div>
                <span className={styles.orderNumber}>{o.order_number}</span>
                <span className={styles.orderDate}>{new Date(o.created_at).toLocaleDateString()} · {o.item_count} item{o.item_count !== 1 ? 's' : ''}</span>
              </div>
              <span className={styles.status} data-status={o.status}>{o.status.replace(/_/g, ' ')}</span>
              <span className={styles.orderTotal}>{formatPKR(Number(o.total))}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
