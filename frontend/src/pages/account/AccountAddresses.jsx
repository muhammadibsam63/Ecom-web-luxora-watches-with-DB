import { useEffect, useState } from 'react';
import { Plus, Trash2 } from '../../components/icons';
import { userService } from '../../services/shopServices';
import { useToast } from '../../components/Toast';
import styles from './AccountForm.module.css';
import listStyles from './AccountOverview.module.css';

const EMPTY = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isDefault: false };

export default function AccountAddresses() {
  const [addresses, setAddresses] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => userService.listAddresses().then(({ addresses }) => setAddresses(addresses)).catch(() => setAddresses([]));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.createAddress(form);
      toast.success('Address added.');
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err.message || 'Could not delete address.');
    }
  };

  return (
    <div>
      <div className={listStyles.sectionHeader} style={{ marginBottom: 32 }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>Addresses</h1>
        <button className="btn btn-outline" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} style={{ marginRight: 6 }} /> Add Address
        </button>
      </div>

      {showForm && (
        <form className={styles.card} onSubmit={handleSubmit}>
          <h2>New Address</h2>
          <label className={styles.field}><span>Full Name</span><input placeholder="Enter your full name" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} /></label>
          <label className={styles.field}><span>Phone</span><input placeholder="Enter your phone number" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></label>
          <label className={styles.field}><span>Address Line 1</span><input placeholder="Enter your street address" required value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} /></label>
          <label className={styles.field}><span>Address Line 2</span><input placeholder="Apartment, suite or floor (optional)" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} /></label>
          <label className={styles.field}><span>City</span><input placeholder="Enter your city" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></label>
          <label className={styles.field}><span>State</span><input placeholder="Enter your province" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} /></label>
          <label className={styles.field}><span>Postal Code</span><input placeholder="Enter your postal code" required value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} /></label>
          <label className={styles.field}><span>Country</span><input placeholder="Enter your country" required value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} /></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            Set as default address
          </label>
          <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={saving}>
            {saving ? 'Saving…' : 'Save Address'}
          </button>
        </form>
      )}

      {addresses?.length === 0 && !showForm && <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>No saved addresses yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {addresses?.map((a) => (
          <div key={a.id} className={listStyles.orderCard}>
            <div>
              <span className={listStyles.orderNumber}>{a.full_name} {a.is_default && <em style={{ color: 'var(--color-gold)', fontStyle: 'normal', fontSize: '0.7rem' }}> · Default</em>}</span>
              <span className={listStyles.orderDate}>{a.line1}, {a.city}, {a.country}</span>
            </div>
            <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)' }} aria-label="Delete address">
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
