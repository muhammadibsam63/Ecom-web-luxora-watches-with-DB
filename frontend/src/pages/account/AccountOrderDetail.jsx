import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check } from '../../components/icons';
import { useStaggerReveal } from '../../animations/useScrollAnimations';
import { orderService } from '../../services/shopServices';
import styles from './AccountOrderDetail.module.css';
import { formatPKR } from '../../utils/currency';

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const LABELS = {
  pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
};

export default function AccountOrderDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const timelineRef = useStaggerReveal({ y: 0, stagger: 0.12, selector: `.${styles.step}` });

  useEffect(() => {
    orderService.getById(id).then(setData).catch(() => setData(false));
  }, [id]);

  if (data === null) return (
    <div>
      <div className="skeleton" style={{ height: 12, width: 130, marginBottom: 24 }} />
      <div className={styles.header}>
        <div>
          <div className="skeleton" style={{ height: 22, width: 160, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 11, width: 120 }} />
        </div>
        <div className="skeleton" style={{ height: 20, width: 90 }} />
      </div>
      <div className="skeleton" style={{ height: 48, width: '100%', marginBottom: 24, borderRadius: 'var(--radius-md)' }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0' }}>
          <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 10, width: '25%' }} />
          </div>
        </div>
      ))}
    </div>
  );
  if (data === false) return <p>Order not found.</p>;

  const { order, items } = data;
  const isCancelled = order.status === 'cancelled';
  const currentIndex = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div>
      <Link to="/account/orders" className={styles.back}>← Back to Orders</Link>
      <div className={styles.header}>
        <div>
          <h1>{order.order_number}</h1>
          <p>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
        </div>
        <span className={styles.total}>{formatPKR(Number(order.total))}</span>
      </div>

      {!isCancelled ? (
        <div className={styles.timeline} ref={timelineRef}>
          {TIMELINE_STEPS.map((step, i) => (
            <div key={step} className={styles.step} data-done={i <= currentIndex}>
              <span className={styles.dot}>{i <= currentIndex ? <Check size={12} /> : i + 1}</span>
              <span className={styles.label}>{LABELS[step]}</span>
              {i < TIMELINE_STEPS.length - 1 && <span className={styles.connector} data-done={i < currentIndex} />}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.cancelledBanner}>This order was cancelled.</div>
      )}

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <img src={item.product_image} alt="" />
            <div><span>{item.product_name}</span><span className={styles.qty}>Qty {item.quantity}</span></div>
            <span>{formatPKR((Number(item.unit_price) * item.quantity))}</span>
          </div>
        ))}
      </div>

      <div className={styles.summaryGrid}>
        <div>
          <h3>Shipping Address</h3>
          <p>{order.shipping_address.full_name || order.contact_email}</p>
          <p>{order.shipping_address.line1}</p>
          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
          <p>{order.shipping_address.country}</p>
        </div>
        <div>
          <h3>Payment</h3>
          <p>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
          <p>Status: {order.payment_status}</p>
        </div>
        <div>
          <h3>Totals</h3>
          <div className={styles.totalRow}><span>Subtotal</span><span>{formatPKR(Number(order.subtotal))}</span></div>
          <div className={styles.totalRow}><span>Shipping</span><span>{formatPKR(Number(order.shipping_fee))}</span></div>
          <div className={styles.totalRow}><span>Tax</span><span>{formatPKR(Number(order.tax))}</span></div>
          {Number(order.discount) > 0 && <div className={styles.totalRow}><span>Discount</span><span>-{formatPKR(Number(order.discount))}</span></div>}
        </div>
      </div>
    </div>
  );
}
