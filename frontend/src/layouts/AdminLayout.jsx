import { useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Layers, ShoppingCart, Users, Boxes, Star,
  Bell, ClipboardList, Settings, LogOut, Mail,
} from '../components/icons';
import { useAuthStore } from '../context/authStore';
import AdminHeader from '../pages/admin/AdminHeader';
import AdminCommandPalette from '../pages/admin/AdminCommandPalette';
import styles from './AdminLayout.module.css';

const LINK_GROUPS = [
  {
    label: 'Overview',
    links: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Catalog',
    links: [
      { label: 'Products', to: '/admin/products', icon: Package },
      { label: 'Categories', to: '/admin/categories', icon: Tags },
      { label: 'Collections', to: '/admin/collections', icon: Layers },
      { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
      { label: 'Reviews', to: '/admin/reviews', icon: Star },
    ],
  },
  {
    label: 'Sales',
    links: [
      { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
      { label: 'Customers', to: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'System',
    links: [
      { label: 'Messages', to: '/admin/messages', icon: Mail },
      { label: 'Notifications', to: '/admin/notifications', icon: Bell },
      { label: 'Activity Log', to: '/admin/activity-log', icon: ClipboardList },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const { user, status, logout } = useAuthStore();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (user && user.role !== 'admin') return <Navigate to="/" replace />;
  if (!user) return null;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logoMain}>LUXORA</span>
          <span className={styles.logoSub}>ADMIN</span>
        </div>
        <nav className={styles.nav}>
          {LINK_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <span className={styles.navGroupLabel}>{group.label}</span>
              {group.links.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <button className={styles.logout} onClick={logout}>
          <LogOut size={16} strokeWidth={1.5} /> Sign Out
        </button>
      </aside>
      <div className={styles.main}>
        <AdminHeader onOpenPalette={() => setPaletteOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <AdminCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
