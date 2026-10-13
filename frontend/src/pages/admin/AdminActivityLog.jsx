import { useEffect, useState } from 'react';
import { adminActivityLogService } from '../../services/adminServices';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';

function formatAction(action) {
  return action.replace(/\./g, ' → ').replace(/_/g, ' ');
}

export default function AdminActivityLog() {
  const [activity, setActivity] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setActivity(null);
    adminActivityLogService.list({ page, limit: 30 }).then(({ activity, pagination }) => {
      setActivity(activity);
      setPagination(pagination);
    }).catch(() => setActivity([]));
  }, [page]);

  return (
    <div>
      <div className={styles.header}><h1>Activity Log</h1></div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Admin</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Date</th></tr></thead>
          <tbody>
            {activity === null && <TableSkeleton rows={6} columns={5} />}
            {activity?.length === 0 && <tr><td colSpan={5} className={styles.empty}>No activity recorded yet.</td></tr>}
            {activity?.map((a) => (
              <tr key={a.id}>
                <td>{a.admin_name || 'Unknown'}</td>
                <td style={{ textTransform: 'capitalize' }}>{formatAction(a.action)}</td>
                <td style={{ textTransform: 'capitalize' }}>{a.entity_type}</td>
                <td>{a.entity_id ? `${a.entity_id.slice(0, 8)}…` : '—'}</td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
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
    </div>
  );
}
