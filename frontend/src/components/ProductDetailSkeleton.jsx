import styles from '../pages/ProductDetail.module.css';

// Mirrors the real ProductDetail layout (gallery + info column) so the page
// doesn't jump once data arrives.
export default function ProductDetailSkeleton() {
  return (
    <div className={styles.page}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 'var(--radius-md)' }} />
          </div>
          <div className={styles.thumbs}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        </div>

        <div className={styles.info}>
          <div className="skeleton" style={{ height: 11, width: '25%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 30, width: '75%', marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 14, width: '35%', marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 26, width: '30%', marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 48, width: '100%', marginBottom: 14, borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ height: 48, width: '100%', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    </div>
  );
}
