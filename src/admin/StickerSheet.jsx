import { useState } from 'react';
import { COMPANY } from '../data/catalog';
import { Button } from '../components/ui';
import { getQuery, goBack } from '../hooks/useRoute';
import { ErrorNote } from './fields';
import useAsync from './useAsync';

const PAGE_SIZE = 300; // the backend's largest page

const SIZES = {
  small: { label: 'Small (4 per row)', grid: 'grid-cols-4', code: 'text-2xl', name: 'text-[10px]' },
  large: { label: 'Large (3 per row)', grid: 'grid-cols-3', code: 'text-4xl', name: 'text-xs' },
};

// every page of products matching the filters (visible products only — hidden ones aren't on the shelves)
const loadAll = async (api, filters) => {
  const first = await api.products.list({ ...filters, page: 1, page_size: PAGE_SIZE });
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, (first.total_pages ?? 1) - 1) }, (_, i) => api.products.list({ ...filters, page: i + 2, page_size: PAGE_SIZE })),
  );
  return [first, ...rest].flatMap((r) => r.data).filter((p) => p.active);
};

/** /admin/stickers: shelf stickers (code, name, category) for the products filtered on the Products page, ready to print.
 * Opened in the same tab: the admin session is per tab, so a new tab would have to sign in again. */
export default function StickerSheet({ api }) {
  const query = getQuery();
  const filters = { category: query.get('category') ?? '', search: query.get('search') ?? '', new_arrival: query.get('new_arrival') ?? '' };
  const [size, setSize] = useState('small');
  const { result: products, error, loading } = useAsync(() => loadAll(api, filters), [api]);
  const s = SIZES[size];
  const scope = [filters.category || 'All categories', filters.search && `“${filters.search}”`, filters.new_arrival && 'new arrivals'].filter(Boolean).join(' · ');

  return (
    <div className="min-h-svh bg-bg print:bg-white">
      <style>{'@page { size: A4; margin: 10mm; }'}</style>
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-3 print:hidden">
        <Button variant="secondary" size="sm" onClick={goBack}>
          Back
        </Button>
        <div>
          <h1 className="font-semibold">Shelf stickers</h1>
          <p className="text-xs text-muted">
            {scope} · {loading ? 'loading…' : `${products?.length ?? 0} stickers`}
          </p>
        </div>
        <select
          aria-label="Sticker size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="ml-auto rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
        >
          {Object.entries(SIZES).map(([id, o]) => (
            <option key={id} value={id}>
              {o.label}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={() => window.print()} disabled={!products?.length}>
          Print
        </Button>
      </header>

      <div className="p-4 print:p-0">
        <ErrorNote error={error} />
        <div className={`mx-auto grid max-w-5xl gap-2 ${s.grid}`}>
          {products?.map((p) => (
            <div key={p.id} className="flex break-inside-avoid flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink/40 bg-white px-2 py-3 text-center text-black">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-black/60">{COMPANY.name}</p>
              <p className={`my-1 font-mono font-extrabold tracking-wider ${s.code}`}>{p.code}</p>
              <p className={`line-clamp-2 font-semibold leading-tight ${s.name}`}>{p.name}</p>
              <p className="mt-0.5 text-[9px] text-black/60">{p.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
