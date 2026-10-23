import { useEffect, useRef, useState } from 'react';

/** True once the element has scrolled into view (fires once). */
export default function useInView({ threshold = 0.12 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (!('IntersectionObserver' in window)) return setInView(true);
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return [ref, inView];
}
