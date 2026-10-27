import { useState } from 'react';
import { Card, EmptyState, Icon } from '../ui';
import CompareTable from './CompareTable';
import CompareProductPicker from './CompareProductPicker';
import { COMPARE_PAGE } from '../../data/content';
import { getProduct } from '../../utils/catalog';
import { MAX_COMPARE_BRANDS, buildComparison, getCompareBrands } from '../../utils/compare';

/** Full-page brand comparison: pick products, pick up to 3 brands, compare specs and prices. */
export default function ComparePage({ productIds, onToggleProduct, onBack, onAddBrand }) {
  const products = productIds.map(getProduct);
  const brands = getCompareBrands(products);
  // ordered brand ids, one per column — starts empty, the customer chooses; brands no selected product carries drop out
  const [picked, setPicked] = useState([]);
  const available = new Set(brands.map((b) => b.id));
  const brandIds = picked.filter((id) => available.has(id));
  const selected = brandIds.map((id) => brands.find((b) => b.id === id));
  const toggleBrand = (id) =>
    setPicked(brandIds.includes(id) ? brandIds.filter((x) => x !== id) : brandIds.length < MAX_COMPARE_BRANDS ? [...brandIds, id] : brandIds);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-24 sm:pb-14 lg:pt-28">
      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        {/* left: title, categories, product + brand selection. No overflow here — it would clip the dropdowns. */}
        <aside className="space-y-5">
          <div>
            <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-primary">
              <Icon name="arrow" className="h-4 w-4 rotate-180" /> Back to shop
            </button>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{COMPARE_PAGE.title}</h1>
            <p className="mt-1 text-sm text-ink/70">{COMPARE_PAGE.subtitle}</p>
          </div>
          <CompareProductPicker
            productIds={productIds}
            onToggleProduct={onToggleProduct}
            brands={brands}
            brandIds={brandIds}
            maxBrands={MAX_COMPARE_BRANDS}
            onToggleBrand={toggleBrand}
          />
        </aside>

        {/* right: the comparison only */}
        <section className="min-w-0" aria-label="Comparison">
          {products.length && selected.length ? (
            <CompareTable
              comparison={buildComparison(productIds, selected)}
              onRemoveBrand={toggleBrand}
              onAddToQuote={(brandId) => onAddBrand(productIds, brandId)}
            />
          ) : (
            <Card>
              {products.length ? (
                <EmptyState title="Choose a brand" message="Pick up to 3 brands on the left to see them side by side." />
              ) : (
                <EmptyState title="Choose a product" message="Pick a category and products on the left to compare them across brands." />
              )}
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
