import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from '../components/icons';
import { orderService } from '../services/shopServices';
import styles from './OrderConfirmation.module.css';
import { formatPKR } from '../utils/currency';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    orderService.getById(id).then(setData).catch(() => setData(false));
  }, [id]);

  if (data === null) return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.header}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ height: 22, width: 220, margin: '0 auto 10px' }} />
        <div className="skeleton" style={{ height: 12, width: 280, margin: '0 auto' }} />
      </div>
      <div className={styles.card}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 14, width: '100%', marginBottom: 14 }} />
        ))}
      </div>
    </div>
  );
  if (data === false) return (
    <div className={styles.wrap}>
      <p>We couldn't find that order.</p>
      <Link to="/account/orders" className="btn btn-outline">View Your Orders</Link>
    </div>
  );

  const { order, items } = data;
  const address = order.shipping_address;
  const estDelivery = new Date(order.created_at);
  estDelivery.setDate(estDelivery.getDate() + 7);

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.header}>
        <CheckCircle2 size={48} strokeWidth={1} className={styles.icon} />
        <h1>Order Confirmed</h1>
        <p>Thank you for choosing Luxora. A confirmation has been sent to {order.contact_email}.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.row}><span>Order Number</span><strong>{order.order_number}</strong></div>
        <div className={styles.row}><span>Estimated Delivery</span><strong>{estDelivery.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
        <div className={styles.row}><span>Shipping Address</span><strong>{address.line1}, {address.city}, {address.country}</strong></div>
        <div className={styles.row}><span>Payment Method</span><strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}</strong></div>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <img src={item.product_image} alt="" />
            <div><span>{item.product_name}</span><span className={styles.qty}>Qty {item.quantity}</span></div>
            <span>{formatPKR((Number(item.unit_price) * item.quantity))}</span>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}><span>Total</span><span>{formatPKR(Number(order.total))}</span></div>

      <div className={styles.actions}>
        <Link to="/account/orders" className="btn btn-outline">View Order Details</Link>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
