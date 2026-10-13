import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import { useToast } from '../../components/Toast';
import styles from './AccountForm.module.css';

export default function AccountSettings() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState({ orderUpdates: true, newArrivals: true, promotions: false });

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/');
  };

  return (
    <div>
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.card}>
        <h2>Notifications</h2>
        {[
          { key: 'orderUpdates', label: 'Order updates' },
          { key: 'newArrivals', label: 'New arrivals' },
          { key: 'promotions', label: 'Promotions & offers' },
        ].map((n) => (
          <label key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            {n.label}
            <input
              type="checkbox"
              checked={notifications[n.key]}
              onChange={(e) => setNotifications((f) => ({ ...f, [n.key]: e.target.checked }))}
            />
          </label>
        ))}
      </div>

      <div className={styles.card}>
        <h2>Account</h2>
        <button className="btn btn-outline" style={{ width: 'fit-content' }} onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
}
