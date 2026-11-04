import { useEffect, useRef, useState } from 'react';
import { shortBrandName } from '../../utils/catalog';
import { Icon } from '../ui';

/**
 * Brands across the top of the products page, the Amazon way: a row of brand tiles — tap one (or several) to see only
 * their products, tap again (or "Clear") to see every brand.
 * `brands` is [{ brand, count }] for the products in the chosen category; it scrolls sideways when it doesn't fit.
 */
export default function BrandBar({ brands, selected, onChange }) {
  const row = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = () => {
    const el = row.current;
    if (el) setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [brands.length]);
  // back to the start when the choice changes, where the chosen brands now are
  // (braces matter: newer browsers' scrollTo returns a Promise, and an effect may only return a clean-up function)
  useEffect(() => {
    row.current?.scrollTo({ left: 0 });
  }, [selected.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const scroll = (dir) => void row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: 'smooth' });
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((b) => b !== id) : [...selected, id]);

  if (!brands.length) return null;

  const arrow =
    'grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink transition hover:border-ink/40 disabled:cursor-default disabled:opacity-35';
  // chosen brands come first so they're always in view
  const ordered = [...brands.filter((b) => selected.includes(b.brand.id)), ...brands.filter((b) => !selected.includes(b.brand.id))];

  const tile = (active) =>
    `relative flex h-14 w-28 shrink-0 sm:h-[5.5rem] sm:w-32 flex-col items-center justify-center gap-1 rounded-lg border bg-surface px-2 text-center transition ${
      active ? 'border-primary ring-2 ring-primary/30' : 'border-line hover:border-ink/40 hover:shadow-sm'
    }`;

  return (
    <section aria-label="Brands">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-ink sm:text-base">Brands</h2>
        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="text-sm text-primary hover:underline">
              Clear {selected.length === 1 ? 'brand' : `${selected.length} brands`}
            </button>
          )}
          {/* the arrows sit up here, never on top of a brand */}
          {(edges.left || edges.right) && (
            <div className="hidden gap-1 sm:flex">
              <button type="button" onClick={() => scroll(-1)} disabled={!edges.left} aria-label="Scroll brands left" className={arrow}>
                <Icon name="chevronLeft" className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => scroll(1)} disabled={!edges.right} aria-label="Scroll brands right" className={arrow}>
                <Icon name="chevronRight" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div
          ref={row}
          onScroll={measure}
          className="flex gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filter by brand"
        >
          {ordered.map(({ brand, count }) => {
            const active = selected.includes(brand.id);
            return (
              <button key={brand.id} type="button" onClick={() => toggle(brand.id)} aria-pressed={active} className={tile(active)} title={brand.name}>
                {active && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-sm bg-primary text-white">
                    <Icon name="check" className="h-3 w-3" />
                  </span>
                )}
                {/* the brand's name set like a logo (no logo files yet) */}
                <span className="line-clamp-2 font-display text-[0.85rem] font-bold sm:text-[0.95rem] leading-tight tracking-tight text-ink">{shortBrandName(brand)}</span>
                <span className="text-[0.7rem] text-muted">
                  {count} product{count === 1 ? '' : 's'}
                </span>
              </button>
            );
          })}
      </div>
    </section>
  );
}
