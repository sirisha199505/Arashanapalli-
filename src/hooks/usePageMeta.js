import { useEffect } from 'react';
import { COMPANY } from '../data/catalog';

const DEFAULT_TITLE = `${COMPANY.name} – Hardware & Interior Products`;

// one <meta> per name / property, created on first use
const setMeta = (attr, key, content) => {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

/**
 * Title, description and share-preview tags for the current page (search results, browser tab, shared links).
 * Link previews in WhatsApp / Instagram read the HTML before any script runs, so category pages also get
 * pre-built HTML with these tags at build time (scripts/prerender.mjs). Pass nothing to leave the tags alone.
 */
export default function usePageMeta(meta) {
  const { title, description, image } = meta ?? {};
  const skip = !meta; // pages that set their own meta pass nothing here
  useEffect(() => {
    if (skip) return;
    const fullTitle = title ? `${title} | ${COMPANY.name}` : DEFAULT_TITLE;
    document.title = fullTitle;
    if (description) setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    if (description) setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', window.location.href);
    if (image) setMeta('property', 'og:image', new URL(image, window.location.origin).href);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
  }, [skip, title, description, image]);
}
