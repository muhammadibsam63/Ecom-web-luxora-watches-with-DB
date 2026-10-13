export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '32px 24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ aspectRatio: '1 / 1', width: '100%' }} />
          <div className="skeleton" style={{ height: 12, width: '60%', marginTop: 14 }} />
          <div className="skeleton" style={{ height: 14, width: '85%', marginTop: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '35%', marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}
