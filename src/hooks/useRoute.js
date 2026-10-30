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

const currentPath = () => window.location.pathname.replace(/\/+$/, '') || '/';

/** Opens another page at its own URL, so refresh, sharing and the back button all work. */
export const navigate = (path) => {
  if (path === currentPath()) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.history.pushState({ inApp: true }, '', path);
  window.dispatchEvent(new Event(ROUTE_EVENT));
};

/** Back to the previous page of the site, or home when the visitor arrived on this page directly. */
export const goBack = () => (window.history.state?.inApp ? window.history.back() : navigate('/'));

// plain <a href="/about"> links switch page without a full reload; new-tab clicks and external links are left alone
const onLinkClick = (e) => {
  const link = e.target.closest?.('a[href^="/"]');
  if (!link || link.target || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  navigate(link.getAttribute('href'));
};

/** The current page path ('/', '/about', '/gallery' …). */
export default function useRoute() {
  const [path, setPath] = useState(() => {
    const legacy = LEGACY_HASHES[window.location.hash];
    if (legacy) window.history.replaceState(null, '', legacy);
    return currentPath();
  });

  useEffect(() => {
    const sync = () => {
      setPath(currentPath());
      window.scrollTo({ top: 0 });
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

  return path;
}
