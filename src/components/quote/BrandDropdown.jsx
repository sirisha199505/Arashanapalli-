import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui';
import { formatCurrency } from '../../utils/format';

const notAvailable = (n) => `${n} item${n === 1 ? '' : 's'} not available`;

/**
 * Brand for the whole quote (Swiggy style): each brand with its total for the items and a "Budget friendly" tag.
 * Choosing one applies it to every item; `mixed` shows when items currently use different brands.
 */
export default function BrandDropdown({ options, selectedId, mixed, onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((o) => o.brand.id === selectedId);

  useEffect(() => {
    if (!open) return undefined;
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

  const choose = (id) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 text-left transition ${
          open ? 'border-primary ring-2 ring-primary/15' : selected ? 'border-line hover:border-ink/30' : 'border-primary/60 hover:border-primary'
        }`}
      >
        {selected ? (
          <span className="min-w-0">
            <span className="block text-xs text-ink/70">Brand · {selected.brand.tier}</span>
            <span className="block truncate font-semibold text-ink">{selected.brand.name}</span>
          </span>
        ) : mixed ? (
          <span className="min-w-0">
            <span className="block text-xs text-ink/70">Brand</span>
            <span className="block font-semibold text-ink">Mixed brands</span>
          </span>
        ) : (
          <span className="font-semibold text-primary">Select brand</span>
        )}
        <Icon name="chevronDown" className={`h-5 w-5 shrink-0 text-ink/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul role="listbox" aria-label="Brands" className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-lg">
          {options.map(({ brand, subtotal, available, missing, budget }) => {
            const active = brand.id === selectedId;
            return (
              <li key={brand.id} role="option" aria-selected={active}>
                <button type="button" onClick={() => choose(brand.id)} className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-2 ${active ? 'bg-primary/5' : ''}`}>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                      {brand.name}
                      {budget && <span className="rounded bg-emerald-600/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">Budget friendly</span>}
                    </span>
                    <span className="block text-xs text-ink/70">
                      {brand.tier}
                      {missing > 0 && ` · ${notAvailable(missing)}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-ink">{available ? formatCurrency(subtotal) : '—'}</span>
                  {active ? <Icon name="check" className="h-4 w-4 shrink-0 text-primary" /> : <span className="w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
          <li className="border-t border-line px-4 py-2 text-xs text-ink/70">Applies to all items · totals exclude GST. To mix brands, choose on each item.</li>
        </ul>
      )}
    </div>
  );
}
