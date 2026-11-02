import { useMemo, useState } from 'react';
import { useQuote } from '../../context/QuoteContext';
import { PACKAGES, PRODUCTS } from '../../data/catalog';
import { getBrand, getCategories, getProduct, shortBrandName } from '../../utils/catalog';
import { Button, Card } from '../ui';
import BrandFirstPicker from './BrandFirstPicker';
import CategoryAccordion from './CategoryAccordion';
import ProductSearch from './ProductSearch';

const CATEGORIES = getCategories();
const CATEGORY_COUNTS = PRODUCTS.reduce((counts, p) => ({ ...counts, [p.category]: (counts[p.category] ?? 0) + 1 }), {});

// the ways to pick products
const ADD_MODES = [
  { id: 'brand', label: 'By brand', hint: 'Pick a brand, then its products' },
  { id: 'product', label: 'By product', hint: 'Find products, then choose brands' },
  ...(PACKAGES.length ? [{ id: 'package', label: 'Packages', hint: 'Ready-made sets' }] : []),
];

/**
 * "Add products" — where customers choose what goes in their quote (on the Products page): brand first
 * (class → brand → series → products, added in that brand), product first (search + categories, brands chosen later)
 * or a ready-made package. `category` opens that category's list first.
 */
export default function AddProductsPanel({ category }) {
  const { quote, setQuantity, setItemBrand } = useQuote();
  const { brand, lines, sections } = quote;
  const [open, setOpen] = useState(() => category ?? (lines.length ? null : CATEGORIES[0]));
  const [mode, setMode] = useState('product');
  const qty = useMemo(() => Object.fromEntries(lines.map((l) => [l.product.id, l.quantity])), [lines]);
  const inQuote = useMemo(() => Object.fromEntries(sections.map((s) => [s.category, s.lines.length])), [sections]);
  const lineInfo = useMemo(() => Object.fromEntries(lines.map((l) => [l.product.id, { quantity: l.quantity, brandId: l.brand?.id }])), [lines]);

  // a package: each product with its quantity (added to what's already there), in the package's brand if it names one
  const addPackage = (pkg) =>
    pkg.items.forEach((i) => {
      setQuantity(i.productId, (lineInfo[i.productId]?.quantity ?? 0) + i.quantity);
      if (i.brandId) setItemBrand(i.productId, i.brandId);
    });

  // add one more; with a brand, also set the item to it — an item already in the quote in another brand just switches brand
  const add = (productId, brandId) => {
    const line = lineInfo[productId];
    if (!line || !brandId || line.brandId === brandId) setQuantity(productId, (line?.quantity ?? 0) + 1);
    if (brandId) setItemBrand(productId, brandId);
  };

  return (
    <div>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink/70">Select products</h2>
      <div role="tablist" aria-label="How to add products" className={`mb-3 grid gap-1 rounded-xl bg-surface-2 p-1 ${ADD_MODES.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {ADD_MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-lg px-2 py-1.5 text-left transition ${mode === m.id ? 'bg-surface shadow-sm' : 'hover:bg-surface/60'}`}
          >
            <span className={`block text-sm font-semibold ${mode === m.id ? 'text-primary' : 'text-ink'}`}>{m.label}</span>
            <span className="block text-[11px] leading-tight text-muted">{m.hint}</span>
          </button>
        ))}
      </div>
      {mode === 'package' ? (
        <ul className="space-y-3">
          {PACKAGES.map((pkg) => (
            <li key={pkg.id}>
              <Card className="p-3">
                <p className="font-semibold">{pkg.name}</p>
                {pkg.description && <p className="text-xs text-muted">{pkg.description}</p>}
                <ul className="my-2 space-y-0.5 text-xs">
                  {pkg.items.map((i) => (
                    <li key={i.productId} className="flex justify-between gap-2">
                      <span className="min-w-0 truncate">{getProduct(i.productId)?.name}</span>
                      <span className="shrink-0 text-muted">
                        × {i.quantity}
                        {i.brandId && ` · ${shortBrandName(getBrand(i.brandId))}`}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button size="sm" className="w-full" onClick={() => addPackage(pkg)}>
                  Add all to quote
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      ) : mode === 'brand' ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <BrandFirstPicker lines={lineInfo} onAdd={add} onSetQuantity={setQuantity} />
        </div>
      ) : (
        <div className="space-y-3">
          <ProductSearch brand={brand} qty={qty} onAdd={add} />
          <CategoryAccordion categories={CATEGORIES} counts={CATEGORY_COUNTS} inQuote={inQuote} open={open} onToggle={setOpen} brand={brand} qty={qty} onSetQuantity={setQuantity} />
        </div>
      )}
    </div>
  );
}
