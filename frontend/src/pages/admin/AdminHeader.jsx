import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, ChevronDown, LogOut, UserCircle } from '../../components/icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../context/authStore';
import AdminNotificationBell from './AdminNotificationBell';
import styles from './AdminHeader.module.css';

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/collections': 'Collections',
  '/admin/orders': 'Orders',
  '/admin/users': 'Customers',
  '/admin/inventory': 'Inventory',
  '/admin/reviews': 'Reviews',
  '/admin/messages': 'Messages',
  '/admin/notifications': 'Notifications',
  '/admin/activity-log': 'Activity Log',
  '/admin/settings': 'Settings',
  '/admin/profile': 'Admin Profile',
};

export default function AdminHeader({ onOpenPalette }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'Admin';

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.breadcrumb}>Admin</span>
        <span className={styles.sep}>/</span>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <button className={styles.searchTrigger} onClick={onOpenPalette}>
          <Search size={14} strokeWidth={1.5} />
          <span>Search or jump to…</span>
          <kbd>⌘K</kbd>
        </button>

        <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
        </button>

        <AdminNotificationBell />

        <div className={styles.profileWrap} ref={menuRef}>
          <button className={styles.profileBtn} onClick={() => setMenuOpen((v) => !v)}>
            <span className={styles.avatar}>{user?.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user?.full_name?.charAt(0)}</span>
            <span className={styles.profileName}>{user?.full_name?.split(' ')[0]}</span>
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>
          {menuOpen && (
            <div className={styles.profileMenu}>
              <Link to="/admin/profile" className={styles.profileMenuItem} onClick={() => setMenuOpen(false)}>
                <UserCircle size={15} strokeWidth={1.5} /> Admin Profile
              </Link>
              <button className={styles.profileMenuItem} onClick={handleLogout}>
                <LogOut size={15} strokeWidth={1.5} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
