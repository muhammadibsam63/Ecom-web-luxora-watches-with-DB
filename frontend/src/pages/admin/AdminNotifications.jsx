import { useEffect, useState } from 'react';
import { Bell } from '../../components/icons';
import { adminNotificationService } from '../../services/adminServices';
import styles from './AdminTable.module.css';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = () => {
    adminNotificationService.list().then(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    }).catch(() => setNotifications([]));
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await adminNotificationService.markRead(id); load(); };
  const markAllRead = async () => { await adminNotificationService.markAllRead(); load(); };

  return (
    <div>
      <div className={styles.header}>
        <h1>Notifications {unreadCount > 0 && <span style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>({unreadCount} unread)</span>}</h1>
        {unreadCount > 0 && <button className="btn btn-outline" onClick={markAllRead}>Mark All Read</button>}
      </div>

      {notifications === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 4px' }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 12, width: `${50 + (i % 3) * 12}%` }} />
                <div className="skeleton" style={{ height: 10, width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {notifications?.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0', color: 'var(--color-text-tertiary)' }}>
          <Bell size={36} strokeWidth={1} />
          <p>No notifications yet.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {notifications?.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            style={{
              display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left',
              padding: '16px 18px', background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)', borderLeft: n.is_read ? '1px solid var(--color-border)' : '2px solid var(--color-gold)',
              borderRadius: 'var(--radius-sm)', marginBottom: 2,
            }}
          >
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{n.title}</span>
            {n.body && <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{n.body}</span>}
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>{new Date(n.created_at).toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
