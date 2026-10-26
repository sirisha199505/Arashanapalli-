import { useCallback, useEffect, useState } from 'react';

const isAt = (route) => window.location.hash === `#${route}`;

/** A full "page" that lives at `#route`, so the browser back button closes it. */
export default function useHashRoute(route) {
  const [active, setActive] = useState(() => isAt(route));

  useEffect(() => {
    const sync = () => {
      const now = isAt(route);
      setActive(now);
      window.scrollTo({ top: 0 });
      // leaving via an in-page link (#products …): scroll there once the home page has rendered again
      if (!now && window.location.hash) {
        requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' }));
      }
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [route]);

  const open = useCallback(() => {
    window.location.hash = route;
  }, [route]);

  const close = useCallback(() => {
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    setActive(false);
  }, []);

  return { active, open, close };
}
