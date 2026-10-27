import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const MAX_SHOWN = 50;
const PANEL_HEIGHT = 340; // search + list (max-h-72) + note

/**
 * Multi-select dropdown of checkboxes. `items`: [{ id, label, meta?, disabled? }].
 * Pass `search` + `onSearch` to get a search box; at most 50 rows render so long lists stay fast.
 */
export default function MultiSelect({ items, selectedIds, onToggle, summary, search, onSearch, searchPlaceholder = 'Search…', note }) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const searchable = onSearch !== undefined;

  useEffect(() => {
    if (!open) return undefined;
    searchRef.current?.focus();
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const shown = items.slice(0, MAX_SHOWN);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          // open upward when there isn't room below (e.g. the last dropdown near the bottom of the screen)
          const r = rootRef.current.getBoundingClientRect();
          setDropUp(window.innerHeight - r.bottom < PANEL_HEIGHT && r.top > window.innerHeight - r.bottom);
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 text-left text-sm font-medium text-ink transition ${
          open ? 'border-primary ring-2 ring-primary/15' : 'border-line hover:border-ink/30'
        }`}
      >
        <span className="truncate">{summary}</span>
        <Icon name="chevronDown" className={`h-4 w-4 shrink-0 text-ink/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute inset-x-0 z-20 overflow-hidden rounded-lg border border-line bg-surface shadow-lg ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {searchable && (
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Icon name="search" className="h-4 w-4 shrink-0 text-ink/60" />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/50"
              />
            </div>
          )}

          {shown.length ? (
            <ul role="listbox" aria-multiselectable="true" className="max-h-72 overflow-y-auto py-1">
              {shown.map((item) => {
                const checked = selectedIds.includes(item.id);
                const disabled = item.disabled && !checked;
                return (
                  <li key={item.id} role="option" aria-selected={checked} aria-disabled={disabled || undefined}>
                    <label className={`flex items-center gap-3 px-3 py-2 text-sm ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-2'}`}>
                      <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggle(item.id)} className="h-4 w-4 shrink-0 accent-[var(--primary)]" />
                      <span className="min-w-0 flex-1 truncate text-ink">{item.label}</span>
                      {item.meta && <span className="shrink-0 text-xs text-ink/60">{item.meta}</span>}
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-ink/70">No matches.</p>
          )}

          {(note || items.length > MAX_SHOWN) && (
            <p className="border-t border-line px-3 py-2 text-xs text-ink/70">
              {items.length > MAX_SHOWN ? `Showing ${MAX_SHOWN} of ${items.length.toLocaleString('en-IN')} — type to narrow down.` : note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
