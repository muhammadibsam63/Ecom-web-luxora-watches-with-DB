import { useEffect, useState } from 'react';
import { Trash2, UserCog, Ban, CheckCircle } from '../../components/icons';
import { adminUserService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import Modal from './Modal';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = () => {
    setUsers(null);
    adminUserService.list({ search, page, limit: 15 }).then(({ users, pagination }) => {
      setUsers(users);
      setPagination(pagination);
    }).catch(() => setUsers([]));
  };

  useEffect(() => { load(); }, [search, page]); // eslint-disable-line

  const toggleRole = async (u) => {
    try {
      await adminUserService.changeRole(u.id, u.role === 'admin' ? 'customer' : 'admin');
      toast.success('Role updated.');
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update role.');
    }
  };

  const toggleActive = async (u) => {
    try {
      await adminUserService.setActive(u.id, !u.is_active);
      toast.success(u.is_active ? 'User deactivated.' : 'User reactivated.');
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update user.');
    }
  };

  const handleDelete = async () => {
    try {
      await adminUserService.remove(deleteTarget.id);
      toast.success('User deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not delete user.');
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className={styles.header}><h1>Users</h1></div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users === null && <TableSkeleton rows={6} columns={7} />}
            {users?.length === 0 && <tr><td colSpan={7} className={styles.empty}>No users found.</td></tr>}
            {users?.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td><span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeWarn : ''}`}>{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>{u.order_count}</td>
                <td><span className={`${styles.badge} ${u.is_active ? styles.badgeSuccess : styles.badgeError}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.iconAction} onClick={() => toggleRole(u)} aria-label="Toggle admin role"><UserCog size={14} /></button>
                    <button className={styles.iconAction} onClick={() => toggleActive(u)} aria-label="Toggle active">
                      {u.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button className={`${styles.iconAction} ${styles.iconActionDanger}`} onClick={() => setDeleteTarget(u)} aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User">
        <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>
          Delete <strong>{deleteTarget?.full_name}</strong>? Users with order history cannot be deleted — deactivate them instead.
        </p>
        <div className={styles.formActions} style={{ marginTop: 0 }}>
          <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
