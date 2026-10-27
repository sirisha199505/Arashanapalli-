import { useDeferredValue, useMemo, useState } from 'react';
import { Icon, MultiSelect } from '../ui';
import CategoryList from '../quote/CategoryList';
import { PRODUCTS } from '../../data/catalog';
import { getCategories, getProduct, searchCatalog, shortBrandName } from '../../utils/catalog';

const CATEGORIES = getCategories();
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const Field = ({ label, children }) => (
  <div className="space-y-2 border-t border-line px-4 py-4 first:border-t-0">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/70">{label}</h3>
    {children}
  </div>
);

const Pills = ({ items, onRemove }) =>
  items.length > 0 && (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-1 rounded-md border border-line bg-surface-2 py-0.5 pl-2 pr-0.5 text-xs font-medium text-ink">
          {item.label}
          <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.label}`} className="grid h-5 w-5 place-items-center rounded hover:bg-line">
            <Icon name="close" className="h-3 w-3" />
          </button>
        </li>
      ))}
    </ul>
  );

/** Compare sidebar: category list, product dropdown (searchable) and brand dropdown (up to `maxBrands`). */
export default function CompareProductPicker({ productIds, onToggleProduct, brands, brandIds, maxBrands, onToggleBrand }) {
  const [filters, setFilters] = useState({ search: '', category: null });
  const deferred = useDeferredValue(filters);
  const { results, categoryCounts } = useMemo(() => searchCatalog(PRODUCTS, deferred), [deferred]);
  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const brandsFull = brandIds.length >= maxBrands;

  const productItems = useMemo(() => results.map((p) => ({ id: p.id, label: p.name, meta: plural(p.brandIds.length, 'brand') })), [results]);
  const brandItems = brands.map((b) => ({ id: b.id, label: b.name, meta: b.tier, disabled: brandsFull }));

  return (
    <div className="rounded-xl border border-line bg-surface">
      <Field label="Category">
        <CategoryList
          categories={CATEGORIES}
          active={filters.category}
          counts={categoryCounts}
          total={Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
          onChange={(category) => update({ category })}
        />
      </Field>

      <Field label="Products">
        <MultiSelect
          items={productItems}
          selectedIds={productIds}
          onToggle={onToggleProduct}
          summary={productIds.length ? `${plural(productIds.length, 'product')} selected` : 'Choose products'}
          search={filters.search}
          onSearch={(search) => update({ search })}
          searchPlaceholder="Search products or brands…"
        />
        <Pills items={productIds.map(getProduct).map((p) => ({ id: p.id, label: p.name }))} onRemove={onToggleProduct} />
      </Field>

      <Field label={`Brands (up to ${maxBrands})`}>
        {brands.length ? (
          <>
            <MultiSelect
              items={brandItems}
              selectedIds={brandIds}
              onToggle={onToggleBrand}
              summary={brandIds.length ? `${plural(brandIds.length, 'brand')} selected` : 'Choose brands'}
              note={brandsFull ? `Maximum ${maxBrands} — untick one to choose another.` : null}
            />
            <Pills items={brandIds.map((id) => brands.find((b) => b.id === id)).map((b) => ({ id: b.id, label: shortBrandName(b) }))} onRemove={onToggleBrand} />
          </>
        ) : (
          <p className="text-sm text-ink/70">Choose a product first.</p>
        )}
      </Field>
    </div>
  );
}
