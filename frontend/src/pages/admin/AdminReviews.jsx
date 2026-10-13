import { useEffect, useState } from 'react';
import { Trash2, Star } from '../../components/icons';
import { adminReviewService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import Modal from './Modal';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';

export default function AdminReviews() {
  const [reviews, setReviews] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = () => {
    setReviews(null);
    adminReviewService.list({ status: statusFilter }).then(({ reviews }) => setReviews(reviews)).catch(() => setReviews([]));
  };
  useEffect(() => { load(); }, [statusFilter]); // eslint-disable-line

  const setStatus = async (r, status) => {
    try {
      await adminReviewService.setStatus(r.id, status);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update review.');
    }
  };

  const handleDelete = async () => {
    try {
      await adminReviewService.remove(deleteTarget.id);
      toast.success('Review deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not delete review.');
    }
  };

  return (
    <div>
      <div className={styles.header}><h1>Reviews</h1></div>

      <div className={styles.toolbar}>
        <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Date</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {reviews === null && <TableSkeleton rows={6} columns={8} />}
            {reviews?.length === 0 && <tr><td colSpan={8} className={styles.empty}>No reviews found.</td></tr>}
            {reviews?.map((r) => (
              <tr key={r.id}>
                <td>{r.reviewer_name}</td>
                <td>{r.product_name}</td>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--color-gold)' }}><Star size={12} fill="currentColor" strokeWidth={0} /> {r.rating}</span></td>
                <td style={{ maxWidth: 220, whiteSpace: 'normal' }}>{(r.comment || '—').slice(0, 60)}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>{r.is_verified_purchase ? <span className={`${styles.badge} ${styles.badgeSuccess}`}>Verified</span> : '—'}</td>
                <td>
                  <select className={styles.statusSelect} value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </td>
                <td><button className={`${styles.iconAction} ${styles.iconActionDanger}`} onClick={() => setDeleteTarget(r)} aria-label="Delete"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Review">
        <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>Delete this review from <strong>{deleteTarget?.reviewer_name}</strong>?</p>
        <div className={styles.formActions} style={{ marginTop: 0 }}>
          <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
