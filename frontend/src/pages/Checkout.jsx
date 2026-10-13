import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check } from '../components/icons';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import { orderService } from '../services/shopServices';
import { useToast } from '../components/Toast';
import styles from './Checkout.module.css';
import { formatPKR } from '../utils/currency';

const STEPS = ['Customer', 'Shipping', 'Delivery', 'Payment'];

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [form, setForm] = useState({
    contactEmail: user?.email || '',
    contactPhone: '',
    fullName: user?.full_name || '',
    line1: '', line2: '', city: '', state: '', postalCode: '', country: '',
    delivery: 'standard',
    paymentMethod: 'cod',
  });

  if (!user) return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  if (items.length === 0 && step === 0) return <Navigate to="/shop" replace />;

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const shipping = subtotal > 150000 ? 0 : 2500;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = subtotal + shipping + tax;

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const canProceed = () => {
    if (step === 0) return form.contactEmail && form.contactPhone && form.fullName;
    if (step === 1) return form.line1 && form.city && form.postalCode && form.country;
    return true;
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { order } = await orderService.create({
        shippingAddress: {
          fullName: form.fullName, line1: form.line1, line2: form.line2,
          city: form.city, state: form.state, postalCode: form.postalCode, country: form.country,
        },
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        paymentMethod: form.paymentMethod,
        couponCode: couponCode || undefined,
      });
      await useCartStore.getState().fetch();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error(err.message || 'Could not place your order.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.steps}>
        {STEPS.map((label, i) => (
          <div key={label} className={styles.stepItem} data-active={i === step} data-done={i < step}>
            <span className={styles.stepDot}>{i < step ? <Check size={12} /> : i + 1}</span>
            {label}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <div className={styles.formArea}>
          {step === 0 && (
            <div className={styles.stepPanel}>
              <h2>Customer Information</h2>
              <label className={styles.field}><span>Full Name</span><input placeholder="Enter your full name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} /></label>
              <label className={styles.field}><span>Email</span><input placeholder="Enter your email address" type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} /></label>
              <label className={styles.field}><span>Phone</span><input placeholder="Enter your phone number" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} /></label>
            </div>
          )}

          {step === 1 && (
            <div className={styles.stepPanel}>
              <h2>Shipping Address</h2>
              <label className={styles.field}><span>Address Line 1</span><input placeholder="Enter your street address" value={form.line1} onChange={(e) => update('line1', e.target.value)} /></label>
              <label className={styles.field}><span>Address Line 2 (Optional)</span><input placeholder="Apartment, suite or floor (optional)" value={form.line2} onChange={(e) => update('line2', e.target.value)} /></label>
              <div className={styles.fieldRow}>
                <label className={styles.field}><span>City</span><input placeholder="Enter your city" value={form.city} onChange={(e) => update('city', e.target.value)} /></label>
                <label className={styles.field}><span>State / Province</span><input placeholder="Enter your province" value={form.state} onChange={(e) => update('state', e.target.value)} /></label>
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.field}><span>Postal Code</span><input placeholder="Enter your postal code" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} /></label>
                <label className={styles.field}><span>Country</span><input placeholder="Enter your country" value={form.country} onChange={(e) => update('country', e.target.value)} /></label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepPanel}>
              <h2>Delivery Method</h2>
              {[
                { id: 'standard', label: 'Standard Shipping', sub: '5–7 business days', price: subtotal > 150000 ? 'Free' : formatPKR(2500) },
                { id: 'express', label: 'Express Shipping', sub: '2–3 business days', price: formatPKR(4500) },
              ].map((opt) => (
                <label key={opt.id} className={styles.radioCard} data-active={form.delivery === opt.id}>
                  <input type="radio" name="delivery" checked={form.delivery === opt.id} onChange={() => update('delivery', opt.id)} />
                  <div><strong>{opt.label}</strong><span>{opt.sub}</span></div>
                  <span className={styles.radioPrice}>{opt.price}</span>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepPanel}>
              <h2>Payment</h2>
              {[
                { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your watch arrives' },
                { id: 'card', label: 'Card Payment', sub: 'Visa, Mastercard, American Express' },
              ].map((opt) => (
                <label key={opt.id} className={styles.radioCard} data-active={form.paymentMethod === opt.id}>
                  <input type="radio" name="payment" checked={form.paymentMethod === opt.id} onChange={() => update('paymentMethod', opt.id)} />
                  <div><strong>{opt.label}</strong><span>{opt.sub}</span></div>
                </label>
              ))}
              {form.paymentMethod === 'card' && (
                <p className={styles.cardNote}>Card details are collected securely at payment time and are never stored on Luxora's servers.</p>
              )}
              <label className={styles.field} style={{ marginTop: 8 }}>
                <span>Coupon Code (Optional)</span>
                <input placeholder="e.g. WELCOME10" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              </label>
            </div>
          )}

          <div className={styles.navRow}>
            {step > 0 && <button className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>Back</button>}
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" disabled={!canProceed()} onClick={() => setStep((s) => s + 1)}>Continue</button>
            ) : (
              <button className="btn btn-primary" disabled={placing} onClick={handlePlaceOrder}>
                {placing ? 'Placing Order…' : 'Place Order'}
              </button>
            )}
          </div>
        </div>

        <aside className={styles.summary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryItems}>
            {items.map((i) => (
              <div key={i.id} className={styles.summaryItem}>
                <img src={i.image} alt="" />
                <div><span>{i.name}</span><span className={styles.qtyLabel}>Qty {i.quantity}</span></div>
                <span>{formatPKR((Number(i.price) * i.quantity))}</span>
              </div>
            ))}
          </div>
          <div className={styles.totals}>
            <div><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
            <div><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPKR(shipping)}</span></div>
            <div><span>Tax</span><span>{formatPKR(tax)}</span></div>
            <div className={styles.totalRow}><span>Total</span><span>{formatPKR(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
