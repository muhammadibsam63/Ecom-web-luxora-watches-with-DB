import { useEffect } from 'react';

const SITE = 'Luxora Watches';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets the document title, meta description, Open Graph tags and (optionally)
 * JSON-LD structured data for the current page. Cleans the JSON-LD up on unmount.
 */
export default function usePageMeta({ title, description, image, type = 'website', jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — Time, Refined.`;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', window.location.href);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');

    let script;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => { if (script) script.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, type, JSON.stringify(jsonLd || null)]);
}
