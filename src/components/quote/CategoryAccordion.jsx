import { memo, useMemo, useState } from 'react';
import { Icon } from '../ui';
import { PRODUCTS } from '../../data/catalog';
import { getStartingPrice, getUnitPrice } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const PAGE = 30;
const stepBtn = 'grid h-7 w-7 place-items-center text-base font-bold text-ink/70 hover:bg-surface-2 hover:text-ink';

/** Compact product row for the sidebar: name, price, and a small "+" that becomes − qty +. */
const ProductRow = memo(function ProductRow({ product, brand, quantity, onSetQuantity }) {
  const inBrand = brand && product.brandIds.includes(brand.id);
  const price = inBrand ? formatCurrency(getUnitPrice(product, brand)) : `from ${formatCurrency(getStartingPrice(product))}`;
  return (
    <li className="flex items-center gap-2 py-2 pl-3 pr-1">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{product.name}</p>
        <p className="text-xs text-ink/70">
          {price} / {product.unit}
        </p>
      </div>
      {quantity > 0 ? (
        <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-primary/40">
          <button type="button" className={stepBtn} onClick={() => onSetQuantity(product.id, quantity - 1)} aria-label={`Decrease ${product.name}`}>
            −
          </button>
          <span className="w-7 text-center text-sm font-semibold text-primary">{quantity}</span>
          <button type="button" className={stepBtn} onClick={() => onSetQuantity(product.id, quantity + 1)} aria-label={`Increase ${product.name}`}>
            +
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSetQuantity(product.id, 1)}
          aria-label={`Add ${product.name}`}
          className="h-7 shrink-0 rounded-lg border border-line px-3 text-xs font-bold text-primary hover:border-primary"
        >
          ADD
        </button>
      )}
    </li>
  );
});

/** One category's products, 30 at a time, in a scrolling panel — fine with thousands of products. */
function CategoryPanel({ category, brand, qty, onSetQuantity }) {
  const [limit, setLimit] = useState(PAGE);
  const products = useMemo(() => PRODUCTS.filter((p) => p.category === category), [category]);
  const remaining = products.length - limit;
  return (
    <div className="max-h-[55vh] overflow-y-auto border-t border-line">
      <ul className="divide-y divide-line">
        {products.slice(0, limit).map((p) => (
          <ProductRow key={p.id} product={p} brand={brand} quantity={qty[p.id] ?? 0} onSetQuantity={onSetQuantity} />
        ))}
      </ul>
      {remaining > 0 && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="w-full border-t border-line py-2 text-sm font-semibold text-primary hover:bg-surface-2">
          Show more ({remaining.toLocaleString('en-IN')} left)
        </button>
      )}
    </div>
  );
}

/**
 * Categories as dropdowns: tap a category to open its products underneath and add them to the quote.
 * `counts` = products per category, `inQuote` = how many of each category are already in the quote.
 */
export default function CategoryAccordion({ categories, counts, inQuote, open, onToggle, brand, qty, onSetQuantity }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {categories.map((c) => {
        const isOpen = open === c;
        return (
          <section key={c}>
            <button
              type="button"
              onClick={() => onToggle(isOpen ? null : c)}
              aria-expanded={isOpen}
              className={`flex w-full items-center gap-2 px-3 py-3 text-left text-sm font-semibold transition ${isOpen ? 'bg-primary/5 text-primary' : 'text-ink hover:bg-surface-2'}`}
            >
              <span className="min-w-0 flex-1 truncate">{c}</span>
              {inQuote[c] ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white" title={`${inQuote[c]} in your quote`}>
                  {inQuote[c]}
                </span>
              ) : (
                <span className="text-xs font-normal text-ink/60">{(counts[c] ?? 0).toLocaleString('en-IN')}</span>
              )}
              <Icon name="chevronDown" className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <CategoryPanel category={c} brand={brand} qty={qty} onSetQuantity={onSetQuantity} />}
          </section>
        );
      })}
    </div>
  );
}
