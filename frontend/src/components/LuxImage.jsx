import { useEffect, useState } from 'react';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#17191d"/>
      <circle cx="200" cy="180" r="70" fill="none" stroke="#c7b58a" stroke-width="2"/>
      <line x1="200" y1="180" x2="200" y2="140" stroke="#c7b58a" stroke-width="2"/>
      <line x1="200" y1="180" x2="230" y2="190" stroke="#c7b58a" stroke-width="2"/>
      <text x="200" y="300" fill="#6e7178" font-family="sans-serif" font-size="14" text-anchor="middle">
        Image unavailable
      </text>
    </svg>`
  );

function normalizeImageSource(value) {
  if (!value) return null;

  // Direct string
  if (typeof value === 'string') {
    const image = value.trim();

    if (!image) return null;

    // Base64 / Data URI
    if (
      image.startsWith('data:image/') ||
      image.startsWith('data:image')
    ) {
      return image;
    }

    // Blob URL
    if (image.startsWith('blob:')) {
      return image;
    }

    // Normal external URL
    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image;
    }

    // Local/backend path
    if (image.startsWith('/')) {
      return image;
    }

    return image;
  }

  // Sometimes backend returns an object
  if (typeof value === 'object') {
    return normalizeImageSource(
      value.url ||
      value.src ||
      value.image ||
      value.image_url ||
      value.imageUrl ||
      value.path
    );
  }

  return null;
}

export default function LuxImage({
  src,
  alt = '',
  className,
  style,
  aspectRatio,
  ...rest
}) {
  const normalizedSrc = normalizeImageSource(src);

  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setErrored(false);
    setLoaded(false);
  }, [normalizedSrc]);

  const imageSrc =
    !errored && normalizedSrc
      ? normalizedSrc
      : FALLBACK;

  const handleLoad = () => {
    setLoaded(true);
    setErrored(false);
  };

  const handleError = () => {
    console.error('LuxImage failed to load:', normalizedSrc);
    setErrored(true);
    setLoaded(true);
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: aspectRatio || undefined,
        backgroundColor: 'var(--color-bg-elevated-2)',
        ...style,
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
        {...rest}
      />
    </div>
  );
}