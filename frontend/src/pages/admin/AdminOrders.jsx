import { useEffect, useState } from 'react';
import { Eye } from '../../components/icons';
import { adminOrderService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import Modal from './Modal';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';
import { formatPKR } from '../../utils/currency';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

function statusBadgeClass(status) {
  if (status === 'delivered') return styles.badgeSuccess;
  if (status === 'cancelled') return styles.badgeError;
  if (status === 'pending') return styles.badgeWarn;
  return styles.badge;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const toast = useToast();

  const load = () => {
    setOrders(null);
    adminOrderService.list({ search, status: statusFilter, page, limit: 15 }).then(({ orders, pagination }) => {
      setOrders(orders);
      setPagination(pagination);
    }).catch(() => setOrders([]));
  };

  useEffect(() => { load(); }, [search, statusFilter, page]); // eslint-disable-line

  const openDetail = async (order) => {
    try {
      const data = await adminOrderService.getById(order.id);
      setDetail(data);
    } catch (err) {
      toast.error(err.message || 'Could not load order.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminOrderService.updateStatus(id, status);
      toast.success('Order status updated.');
      load();
      if (detail?.order.id === id) setDetail((d) => ({ ...d, order: { ...d.order, status } }));
    } catch (err) {
      toast.error(err.message || 'Could not update order.');
    }
  };

  return (
    <div>
      <div className={styles.header}><h1>Orders</h1></div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search order #, name, email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {orders === null && <TableSkeleton rows={6} columns={8} />}
            {orders?.length === 0 && <tr><td colSpan={8} className={styles.empty}>No orders found.</td></tr>}
            {orders?.map((o) => (
              <tr key={o.id}>
                <td>{o.order_number}</td>
                <td>{o.customer_name}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>{o.item_count}</td>
                <td>{formatPKR(Number(o.total))}</td>
                <td><span className={`${styles.badge} ${o.payment_status === 'paid' ? styles.badgeSuccess : ''}`}>{o.payment_status}</span></td>
                <td><span className={`${styles.badge} ${statusBadgeClass(o.status)}`}>{o.status.replace(/_/g, ' ')}</span></td>
                <td><button className={styles.iconAction} onClick={() => openDetail(o)} aria-label="View"><Eye size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button key={i} className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.order.order_number} width={640}>
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className={styles.field}>
              <span>Status</span>
              <select className={styles.statusSelect} value={detail.order.status} onChange={(e) => updateStatus(detail.order.id, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><strong>Customer:</strong> {detail.order.customer_name} ({detail.order.customer_email})</div>
              <div><strong>Payment:</strong> {detail.order.payment_method} · {detail.order.payment_status}</div>
              <div><strong>Address:</strong> {detail.order.shipping_address.line1}, {detail.order.shipping_address.city}, {detail.order.shipping_address.country}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {detail.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatPKR((Number(item.unit_price) * item.quantity))}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', paddingTop: 8 }}>
              <strong>Total</strong>
              <strong style={{ color: 'var(--color-gold)' }}>{formatPKR(Number(detail.order.total))}</strong>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
