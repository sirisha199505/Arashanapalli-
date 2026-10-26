import { useState } from 'react';
import { Chip, EmptyState, Icon } from '../ui';
import CompareTable from './CompareTable';
import { PRODUCTS } from '../../data/catalog';
import { COMPARE_PAGE } from '../../data/content';
import { getCategories, getProduct, shortBrandName } from '../../utils/catalog';
import { MAX_COMPARE_BRANDS, buildComparison, getCompareBrands } from '../../utils/compare';

const CATEGORIES = getCategories();

const Step = ({ number, title, hint, children }) => (
  <section className="space-y-3">
    <div>
      <h2 className="text-lg font-bold">
        <span className="mr-2 text-primary">{number}.</span>
        {title}
      </h2>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
    {children}
  </section>
);

/** Full-page brand comparison: pick products, pick up to 3 brands, compare specs and prices. */
export default function ComparePage({ productIds, onToggleProduct, onBack, onAddBrand }) {
  const products = productIds.map(getProduct);
  const brands = getCompareBrands(products);
  const [picked, setPicked] = useState(() => brands.slice(0, MAX_COMPARE_BRANDS).map((b) => b.id));
  // brands no longer carried by any selected product drop out of the comparison
  const selected = brands.filter((b) => picked.includes(b.id));
  const full = selected.length >= MAX_COMPARE_BRANDS;

  const toggleBrand = (id) =>
    setPicked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : full ? ids : [...ids, id]));

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 pb-28 pt-24 sm:pb-14 lg:pt-28">
      <div>
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary">
          <Icon name="arrow" className="h-4 w-4 rotate-180" /> Back to shop
        </button>
        <p className="eyebrow">{COMPARE_PAGE.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">{COMPARE_PAGE.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{COMPARE_PAGE.subtitle}</p>
      </div>

      <Step number={1} title="Select products" hint={`${productIds.length} selected`}>
        {CATEGORIES.map((category) => (
          <div key={category}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{category}</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCTS.filter((p) => p.category === category).map((p) => (
                <Chip key={p.id} active={productIds.includes(p.id)} aria-pressed={productIds.includes(p.id)} onClick={() => onToggleProduct(p.id)}>
                  {p.name}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </Step>

      {products.length > 0 && (
        <Step number={2} title={`Choose up to ${MAX_COMPARE_BRANDS} brands`} hint={`${selected.length} of ${MAX_COMPARE_BRANDS} chosen`}>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => {
              const active = picked.includes(b.id);
              return (
                <Chip key={b.id} active={active} aria-pressed={active} disabled={!active && full} onClick={() => toggleBrand(b.id)}>
                  {shortBrandName(b)}
                </Chip>
              );
            })}
          </div>
          {full && <p className="text-xs text-muted">Maximum reached — remove a brand to pick another.</p>}
        </Step>
      )}

      {products.length && selected.length ? (
        <Step number={3} title="Compare">
          <CompareTable comparison={buildComparison(productIds, selected)} onAddBrand={(brandId) => onAddBrand(productIds, brandId)} />
        </Step>
      ) : (
        <EmptyState
          title={products.length ? 'Pick a brand' : 'Pick a product'}
          message={products.length ? 'Choose at least one brand to see the comparison.' : 'Select one or more products above to compare them across brands.'}
        />
      )}
    </main>
  );
}
