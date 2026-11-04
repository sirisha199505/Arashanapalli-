import { useEffect, useState } from 'react';

const ROUTE_EVENT = 'routechange';
// links from the old single-page layout (#about, #quote …) still land on the right page
const LEGACY_HASHES = {
  '#collections': '/products',
  '#products': '/products',
  '#applications': '/applications',
  '#about': '/about',
  '#instagram': '/gallery',
  '#contact': '/contact',
  '#quote': '/quote',
  '#compare': '/compare',
};

const trimPath = (path) => path.replace(/\/+$/, '') || '/';
const currentPath = () => trimPath(window.location.pathname);
const currentLocation = () => currentPath() + window.location.search;

/** The current page's query string as URLSearchParams (?q=hinge&brand=hettich). */
export const getQuery = () => new URLSearchParams(window.location.search);

/**
 * Opens another page at its own URL, so refresh, sharing and the back button all work.
 * `replace` updates the address in place (e.g. while typing a search) without adding a back-button step.
 * `scroll: false` keeps the scroll position even on another page (e.g. picking another size of the same product).
 */
export const navigate = (to, { replace = false, scroll } = {}) => {
  if (to === currentLocation()) {
    if (!replace) window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const samePage = trimPath(to.split('?')[0]) === currentPath();
  window.history[replace ? 'replaceState' : 'pushState'](replace ? window.history.state : { inApp: true }, '', to);
  window.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail: { scroll: scroll ?? !samePage } }));
};

/** Back to the previous page of the site, or home when the visitor arrived on this page directly. */
export const goBack = () => (window.history.state?.inApp ? window.history.back() : navigate('/'));

// plain <a href="/about"> links switch page without a full reload; new-tab clicks, downloads and external links are left alone
const onLinkClick = (e) => {
  const link = e.target.closest?.('a[href^="/"]');
  if (!link || link.target || link.hasAttribute('download') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  navigate(link.getAttribute('href'));
};

/** The current page path ('/', '/about', '/gallery' …). Re-renders when the path or its query string changes. */
export default function useRoute() {
  const [location, setLocation] = useState(() => {
    const legacy = LEGACY_HASHES[window.location.hash];
    if (legacy) window.history.replaceState(null, '', legacy);
    return currentLocation();
  });

  useEffect(() => {
    const sync = (e) => {
      setLocation(currentLocation());
      // filter / search changes on the same page keep the scroll position
      if (e?.detail?.scroll !== false) window.scrollTo({ top: 0, behavior: 'instant' }); // not the site-wide smooth scroll
    };
    window.addEventListener('popstate', sync);
    window.addEventListener(ROUTE_EVENT, sync);
    document.addEventListener('click', onLinkClick);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(ROUTE_EVENT, sync);
      document.removeEventListener('click', onLinkClick);
    };
  }, []);

  return location.split('?')[0];
}
