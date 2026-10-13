import { useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, Sun, Moon, Heart, ShoppingBag, User, Menu } from './icons';
import { gsap } from '../animations/gsapConfig';
import { useTheme } from '../context/ThemeContext';
import { useCartStore } from '../context/cartStore';
import { useWishlistStore } from '../context/wishlistStore';
import { useAuthStore } from '../context/authStore';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/collections' },
  { label: 'New Arrivals', to: '/shop?filter=new' },
  { label: 'Best Sellers', to: '/shop?filter=best' },
  { label: 'Build Your Watch', to: '/build-your-watch' },
  { label: 'Journal', to: '/journal' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const cartCount = useCartStore((s) => s.count);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    gsap.to(navRef.current, {
      boxShadow: scrolled ? '0 10px 32px rgba(0,0,0,0.5)' : '0 4px 18px rgba(0,0,0,0.28)',
      duration: 0.35,
      ease: 'power2.out',
    });
  }, [scrolled]);

  // Global Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header ref={navRef} className={styles.nav} data-scrolled={scrolled}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} aria-label="Luxora Watches home">
            <span className={styles.logoDot} aria-hidden="true" />
            <span className={styles.logoText}>
              <span className={styles.logoMain}>LUXORA</span>
              <span className={styles.logoSub}>WATCHES</span>
            </span>
          </Link>

          <nav className={styles.links} aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search (Ctrl+K)">
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>
            <Link className={styles.iconBtn} to="/wishlist" aria-label="Wishlist">
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
            <button className={styles.iconBtn} onClick={openCart} aria-label="Cart">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </button>
            {user ? (
              <Link className={styles.iconBtn} to="/account" aria-label="Account">
                <User size={18} strokeWidth={1.5} />
              </Link>
            ) : (
              <Link className={styles.signInBtn} to="/login">Sign In</Link>
            )}
            <button className={`${styles.iconBtn} ${styles.menuBtn}`} onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
