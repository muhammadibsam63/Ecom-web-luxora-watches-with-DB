import { useEffect, useState } from 'react';
import { Trash2, Mail, MailOpen, Archive } from '../../components/icons';
import { adminMessageService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import Modal from './Modal';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';

export default function AdminMessages() {
  const [messages, setMessages] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewing, setViewing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = () => {
    setMessages(null);
    adminMessageService.list({ status: statusFilter }).then(({ messages }) => setMessages(messages)).catch(() => setMessages([]));
  };
  useEffect(() => { load(); }, [statusFilter]); // eslint-disable-line

  const openMessage = async (m) => {
    setViewing(m);
    if (m.status === 'unread') {
      try {
        await adminMessageService.setStatus(m.id, 'read');
        load();
      } catch { /* non-critical */ }
    }
  };

  const archive = async (m) => {
    try {
      await adminMessageService.setStatus(m.id, 'archived');
      toast.success('Message archived.');
      load();
      setViewing(null);
    } catch (err) {
      toast.error(err.message || 'Could not archive message.');
    }
  };

  const handleDelete = async () => {
    try {
      await adminMessageService.remove(deleteTarget.id);
      toast.success('Message deleted.');
      setDeleteTarget(null);
      setViewing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not delete message.');
    }
  };

  return (
    <div>
      <div className={styles.header}><h1>Messages</h1></div>

      <div className={styles.toolbar}>
        <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th></th><th>From</th><th>Subject</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {messages === null && <TableSkeleton rows={6} columns={5} />}
            {messages?.length === 0 && <tr><td colSpan={5} className={styles.empty}>No messages yet.</td></tr>}
            {messages?.map((m) => (
              <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => openMessage(m)}>
                <td>{m.status === 'unread' ? <Mail size={14} style={{ color: 'var(--color-gold)' }} /> : <MailOpen size={14} style={{ color: 'var(--color-text-tertiary)' }} />}</td>
                <td>{m.name} <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>({m.email})</span></td>
                <td style={{ maxWidth: 260, whiteSpace: 'normal' }}>{m.subject || m.message.slice(0, 60)}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className={styles.actionsCell}>
                    <button className={styles.iconAction} onClick={() => archive(m)} aria-label="Archive"><Archive size={14} /></button>
                    <button className={`${styles.iconAction} ${styles.iconActionDanger}`} onClick={() => setDeleteTarget(m)} aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.subject || 'Message'}>
        {viewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}>
            <div><strong>{viewing.name}</strong> — {viewing.email}</div>
            <div style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>{new Date(viewing.created_at).toLocaleString()}</div>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-primary)' }}>{viewing.message}</p>
            <div className={styles.formActions} style={{ marginTop: 0 }}>
              <button className="btn btn-outline" onClick={() => archive(viewing)}>Archive</button>
              <a className="btn btn-primary" href={`mailto:${viewing.email}`}>Reply by Email</a>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Message">
        <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>Delete this message from <strong>{deleteTarget?.name}</strong>?</p>
        <div className={styles.formActions} style={{ marginTop: 0 }}>
          <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
