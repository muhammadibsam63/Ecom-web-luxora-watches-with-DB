import { useEffect, useRef, useState } from 'react';
import { Bell } from '../../components/icons';
import { adminNotificationService } from '../../services/adminServices';
import styles from './AdminHeader.module.css';

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = () => {
    adminNotificationService.list().then(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleMarkRead = async (id) => {
    await adminNotificationService.markRead(id);
    load();
  };

  const handleMarkAllRead = async () => {
    await adminNotificationService.markAllRead();
    load();
  };

  return (
    <div className={styles.notifWrap} ref={ref}>
      <button className={styles.iconBtn} onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <Bell size={17} strokeWidth={1.5} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>
      {open && (
        <div className={styles.notifDropdown}>
          <div className={styles.notifHeader}>
            <span>Notifications</span>
            {unreadCount > 0 && <button onClick={handleMarkAllRead}>Mark all read</button>}
          </div>
          <div className={styles.notifList}>
            {notifications.length === 0 && <p className={styles.notifEmpty}>No notifications yet.</p>}
            {notifications.map((n) => (
              <button key={n.id} className={styles.notifItem} data-unread={!n.is_read} onClick={() => handleMarkRead(n.id)}>
                <span className={styles.notifTitle}>{n.title}</span>
                {n.body && <span className={styles.notifBody}>{n.body}</span>}
                <span className={styles.notifTime}>{new Date(n.created_at).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
