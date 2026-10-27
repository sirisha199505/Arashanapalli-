import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '../ui';
import ProductImage from '../product/ProductImage';
import { PRODUCTS } from '../../data/catalog';
import { getStartingPrice, getUnitPrice, searchCatalog } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const MAX_SHOWN = 8;

/** Search box with a results dropdown — add products to the quote without leaving the page. `qty` = productId → quantity in the quote. */
export default function ProductSearch({ brand, qty, onAdd }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const term = useDeferredValue(search).trim();
  const results = useMemo(() => (term ? searchCatalog(PRODUCTS, { search: term }).results : []), [term]);

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

  const price = (p) =>
    brand && p.brandIds.includes(brand.id) ? `${formatCurrency(getUnitPrice(p, brand))} / ${p.unit}` : `from ${formatCurrency(getStartingPrice(p))} / ${p.unit}`;

  return (
    <div ref={rootRef} className="relative">
      <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <Icon name="search" className="h-4 w-4 shrink-0 text-ink/60" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products to add…"
          aria-label="Search products to add"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/50"
        />
      </label>

      {open && term && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          {results.length ? (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto" aria-label="Search results">
              {results.slice(0, MAX_SHOWN).map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                  <ProductImage product={p} className="h-10 w-10 shrink-0 rounded-lg border border-line" padding="p-1" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                    <p className="truncate text-xs text-ink/70">
                      {p.category} · {price(p)}
                    </p>
                  </div>
                  {qty[p.id] ? (
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700">{qty[p.id]} in quote</span>
                      <Button size="sm" variant="secondary" onClick={() => onAdd(p.id)} aria-label={`Add one more ${p.name}`}>
                        +1
                      </Button>
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => onAdd(p.id)} aria-label={`Add ${p.name}`}>
                      Add
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-ink/70">No products match “{term}”.</p>
          )}
          {results.length > MAX_SHOWN && (
            <p className="border-t border-line px-3 py-2 text-xs text-ink/70">
              Showing {MAX_SHOWN} of {results.length.toLocaleString('en-IN')} — type more to narrow down.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
