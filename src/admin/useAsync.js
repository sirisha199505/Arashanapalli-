import { useCallback, useEffect, useState } from 'react';

/** Runs `load` whenever `deps` change. Returns { result, error, loading, reload }; stale responses are ignored. */
export default function useAsync(load, deps) {
  const [state, setState] = useState({ result: null, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let current = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((result) => current && setState({ result, error: null, loading: false }))
      .catch((error) => current && setState((s) => ({ ...s, error, loading: false })));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}

/** `value`, but only after it has stopped changing for `ms` — for search boxes. */
export function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
