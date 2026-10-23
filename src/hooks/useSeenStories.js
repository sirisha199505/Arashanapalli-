import { useCallback, useState } from 'react';

const KEY = 'at-seen-stories';

const load = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY)) ?? []);
  } catch {
    return new Set();
  }
};

/** Remembers (per browser) which story groups were opened, like Instagram's grey ring. */
export default function useSeenStories() {
  const [seen, setSeen] = useState(load);

  const markSeen = useCallback((id) => {
    setSeen((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return { seen, markSeen };
}
