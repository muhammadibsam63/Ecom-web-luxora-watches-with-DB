import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from './icons';
import styles from './Footer.module.css';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Watches', to: '/shop' },
      { label: 'New Arrivals', to: '/shop?filter=new' },
      { label: 'Best Sellers', to: '/shop?filter=best' },
      { label: 'Build Your Watch', to: '/build-your-watch' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Craftsmanship', to: '/about#craftsmanship' },
      { label: 'Journal', to: '/journal' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'Shipping & Returns', to: '/shipping' },
      { label: 'Warranty', to: '/warranty' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <span className={styles.logoMain}>LUXORA</span>
          <span className={styles.logoSub}>WATCHES</span>
          <p className={styles.tagline}>Precision engineered for those who appreciate every second.</p>
          <div className={styles.social}>
            <a href="#" aria-label="Instagram"><Instagram size={17} strokeWidth={1.5} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={17} strokeWidth={1.5} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={17} strokeWidth={1.5} /></a>
          </div>
        </div>

        <div className={styles.columns}>
          {COLUMNS.map((col) => (
            <div key={col.title} className={styles.column}>
              <span className={styles.columnTitle}>{col.title}</span>
              {col.links.map((link) => (
                <Link key={link.label} to={link.to} className={styles.columnLink}>{link.label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Luxora Watches. All rights reserved.</span>
        <div className={styles.legal}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
