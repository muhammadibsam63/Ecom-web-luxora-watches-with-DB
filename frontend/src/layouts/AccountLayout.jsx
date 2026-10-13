import { NavLink, Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../context/authStore';
import styles from './AccountLayout.module.css';

const LINKS = [
  { label: 'Overview', to: '/account' },
  { label: 'Profile', to: '/account/profile' },
  { label: 'Orders', to: '/account/orders' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'Addresses', to: '/account/addresses' },
  { label: 'Settings', to: '/account/settings' },
];

export default function AccountLayout() {
  const { user, status } = useAuthStore();

  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className={`container ${styles.wrap}`}>
        <PageTransition>
          <div className={styles.grid}>
            <aside className={styles.sidebar}>
              <p className={styles.welcome}>Welcome back,<br /><strong>{user.full_name?.split(' ')[0]}</strong></p>
              <nav className={styles.nav}>
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/account'}
                    className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
            </aside>
            <div className={styles.content}>
              <Outlet />
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
