import { useDeferredValue, useMemo, useState } from 'react';
import { BRANDS } from '../../data/catalog';
import { dynamicCode, getBrandProducts, getBrandsByTier, getUnitPrice, searchCatalog } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import { Badge, Icon } from '../ui';

const PAGE = 30;
const stepBtn = 'grid h-7 w-7 place-items-center text-base font-bold text-ink/70 hover:bg-surface-2 hover:text-ink';

/**
 * Option 1 — brand first: class → brand → series, then that brand's products at its prices.
 * ADD puts the product in the quote already set to this brand. `lines` = productId → { quantity, brandId } in the quote.
 */
export default function BrandFirstPicker({ lines, onAdd, onSetQuantity }) {
  const [brandId, setBrandId] = useState(null);
  const brand = BRANDS.find((b) => b.id === brandId);
  return brand ? (
    <BrandProducts key={brand.id} brand={brand} lines={lines} onAdd={onAdd} onSetQuantity={onSetQuantity} onBack={() => setBrandId(null)} />
  ) : (
    <BrandList onPick={(b) => setBrandId(b.id)} />
  );
}

/** Class (tier) headings, each with its brands. */
function BrandList({ onPick }) {
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {getBrandsByTier().map(({ tier, brands }) => (
        <section key={tier}>
          <h3 className="sticky top-0 z-10 border-b border-line bg-surface-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{tier}</h3>
          <ul className="divide-y divide-line">
            {brands.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => onPick(b)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{b.name}</span>
                    <span className="block text-xs text-muted">
                      <span className="font-mono">{b.code}</span> · {getBrandProducts(b).length} products{b.series?.length ? ` · ${b.series.length} series` : ''}
                    </span>
                  </span>
                  <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** One brand: its series as filters, a search, and its products with ADD / − qty +. */
function BrandProducts({ brand, lines, onAdd, onSetQuantity, onBack }) {
  const [seriesId, setSeriesId] = useState(null);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const term = useDeferredValue(search).trim();
  const products = useMemo(() => {
    const inBrand = getBrandProducts(brand, seriesId);
    return term ? searchCatalog(inBrand, { search: term }).results : inBrand;
  }, [brand, seriesId, term]);
  const remaining = products.length - limit;

  return (
    <div>
      <div className="border-b border-line p-3">
        <button type="button" onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          <Icon name="chevronLeft" className="h-3.5 w-3.5" /> All brands
        </button>
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate font-semibold">{brand.name}</p>
          <Badge tone={brand.tier}>{brand.tier}</Badge>
        </div>
        {brand.series?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={`${brand.name} series`}>
            {[{ id: null, name: 'All' }, ...brand.series].map((s) => (
              <button
                key={s.id ?? 'all'}
                type="button"
                onClick={() => (setSeriesId(s.id), setLimit(PAGE))}
                aria-pressed={seriesId === s.id}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${seriesId === s.id ? 'bg-primary text-white' : 'bg-surface-2 text-ink/80 hover:text-ink'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        <label className="mt-2 flex h-9 items-center gap-2 rounded-lg border border-line px-2.5 focus-within:border-primary">
          <Icon name="search" className="h-4 w-4 shrink-0 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => (setSearch(e.target.value), setLimit(PAGE))}
            placeholder={`Search ${brand.name} products`}
            aria-label={`Search ${brand.name} products`}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="max-h-[55vh] overflow-y-auto">
        {products.length ? (
          <ul className="divide-y divide-line">
            {products.slice(0, limit).map((p) => {
              const line = lines[p.id];
              const inThisBrand = line && line.brandId === brand.id;
              return (
                <li key={p.id} className="flex items-center gap-2 py-2 pl-3 pr-1">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug" title={p.name}>
                      {p.name}
                    </p>
                    <p className="text-xs text-ink/70">
                      <span className="font-mono font-semibold">{dynamicCode(p, brand)}</span> · {formatCurrency(getUnitPrice(p, brand))}/{p.unit}
                    </p>
                    {line && !inThisBrand && <p className="text-[11px] font-semibold text-amber-700">In quote in another brand — ADD switches it</p>}
                  </div>
                  {inThisBrand ? (
                    <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-primary/40">
                      <button type="button" className={stepBtn} onClick={() => onSetQuantity(p.id, line.quantity - 1)} aria-label={`Decrease ${p.name}`}>
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-primary">{line.quantity}</span>
                      <button type="button" className={stepBtn} onClick={() => onSetQuantity(p.id, line.quantity + 1)} aria-label={`Increase ${p.name}`}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAdd(p.id, brand.id)}
                      aria-label={`Add ${p.name} in ${brand.name}`}
                      className="h-7 shrink-0 rounded-lg border border-line px-3 text-xs font-bold text-primary hover:border-primary"
                    >
                      ADD
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-3 py-6 text-center text-sm text-muted">No {brand.name} products match.</p>
        )}
        {remaining > 0 && (
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="w-full border-t border-line py-2 text-sm font-semibold text-primary hover:bg-surface-2">
            Show more ({remaining.toLocaleString('en-IN')} left)
          </button>
        )}
      </div>
    </div>
  );
}
