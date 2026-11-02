import { useMemo, useRef, useState } from 'react';
import { Button, Card, Icon } from '../ui';
import BrandFirstPicker from './BrandFirstPicker';
import CategoryAccordion from './CategoryAccordion';
import ProductSearch from './ProductSearch';
import QuoteLineRow from './QuoteLineRow';
import TotalsSummary from './TotalsSummary';
import { PRODUCTS } from '../../data/catalog';
import { getCategories, getCategoryIcon, shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const CATEGORIES = getCategories();
const CATEGORY_COUNTS = PRODUCTS.reduce((counts, p) => ({ ...counts, [p.category]: (counts[p.category] ?? 0) + 1 }), {});

// the two ways to add products — the client asked for both on this screen
const ADD_MODES = [
  { id: 'brand', label: 'By brand', hint: 'Pick a brand, then its products' },
  { id: 'product', label: 'By product', hint: 'Find products, then choose brands' },
];

/**
 * Step 1, full page: left = "Add products", either brand first (class → brand → series → products, added in that brand)
 * or product first (search + categories, brand chosen per item or for the whole quote); middle = your items;
 * right = totals, "Proceed to quote", "Add more products", compare and clear.
 */
export default function QuoteCart({ quote, savedCount, onSaveQuotation, onSetItemBrand, onSetQuantity, onRemove, onProceed, onCompare, onClear }) {
  const { brand, brands, allBranded, lines, sections, totals } = quote;
  // which category dropdown is open — the first one when the quote is empty, so products are right there
  const [open, setOpen] = useState(() => (lines.length ? null : CATEGORIES[0]));
  const [mode, setMode] = useState('product');
  const [savedAs, setSavedAs] = useState(null); // name of the option just saved
  const saveOption = () => setSavedAs(onSaveQuotation(`Option ${savedCount + 1} – ${brands.map(shortBrandName).join(', ') || 'brands not chosen'}`).name);
  const leftRef = useRef(null);
  const qty = useMemo(() => Object.fromEntries(lines.map((l) => [l.product.id, l.quantity])), [lines]);
  const inQuote = useMemo(() => Object.fromEntries(sections.map((s) => [s.category, s.lines.length])), [sections]);
  const lineInfo = useMemo(() => Object.fromEntries(lines.map((l) => [l.product.id, { quantity: l.quantity, brandId: l.brand?.id }])), [lines]);

  // add one more; with a brand, also set the item to it — an item already in the quote in another brand just switches brand
  const add = (productId, brandId) => {
    const line = lineInfo[productId];
    if (!line || !brandId || line.brandId === brandId) onSetQuantity(productId, (line?.quantity ?? 0) + 1);
    if (brandId) onSetItemBrand(productId, brandId);
  };
  const addMore = () => {
    setOpen((o) => o ?? CATEGORIES[0]);
    leftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="grid gap-6 md:grid-cols-[20rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)_20rem] lg:items-start">
      {/* left: add products — brand first or product first */}
      <aside ref={leftRef} className="scroll-mt-[calc(var(--header-h)+1rem)]">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink/70">Add products</h2>
        <div role="tablist" aria-label="How to add products" className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
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
        {mode === 'brand' ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <BrandFirstPicker lines={lineInfo} onAdd={add} onSetQuantity={onSetQuantity} />
          </div>
        ) : (
          <div className="space-y-3">
            <ProductSearch brand={brand} qty={qty} onAdd={add} />
            <CategoryAccordion
              categories={CATEGORIES}
              counts={CATEGORY_COUNTS}
              inQuote={inQuote}
              open={open}
              onToggle={setOpen}
              brand={brand}
              qty={qty}
              onSetQuantity={onSetQuantity}
            />
          </div>
        )}
      </aside>

      {/* middle: your items */}
      <div className="min-w-0 space-y-4">
        <Card className="p-4 sm:p-5">
          <h2 className="text-lg font-bold">
            Your items <span className="text-sm font-medium text-ink/70">({lines.length})</span>
          </h2>
          {sections.length ? (
            sections.map((s) => (
              <section key={s.category} className="mt-4">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name={getCategoryIcon(s.category)} className="h-4 w-4 text-primary" />
                    {s.category}
                  </h3>
                  {s.subtotal > 0 && <span className="text-sm font-bold">{formatCurrency(s.subtotal)}</span>}
                </div>
                <ul className="divide-y divide-line">
                  {s.lines.map((line) => (
                    <QuoteLineRow key={line.key} line={line} onSetBrand={onSetItemBrand} onSetQuantity={onSetQuantity} onRemove={onRemove} />
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-ink/70">
              Your quote is empty — on the left, pick a brand and tap ADD on its products, or search / open a category and choose brands after.
            </p>
          )}
        </Card>
      </div>

      {/* right: totals and next steps (brand for all items is chosen top right; each item can override it) */}
      <Card as="aside" className="space-y-4 p-4 sm:p-5 md:col-span-2 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:col-span-1">
        {allBranded ? (
          <div>
            <p className="mb-3 text-sm text-ink/70">
              {brands.length === 1 ? 'Brand' : 'Brands'}: <span className="font-semibold text-ink">{brands.map((b) => b.name).join(', ')}</span>
            </p>
            <TotalsSummary totals={totals} />
          </div>
        ) : (
          <p className="rounded-lg bg-primary/5 p-3 text-sm text-primary">
            {lines.length
              ? 'Select a brand at the top right for all items, or choose a brand on each item to mix brands.'
              : 'Add products from the categories on the left, then choose a brand.'}
          </p>
        )}
        <div className="grid gap-2">
          <Button size="lg" onClick={onProceed} disabled={!allBranded}>
            {allBranded ? 'Proceed to quote' : lines.length ? 'Select a brand to proceed' : 'Add products to proceed'}
          </Button>
          <Button variant="secondary" size="lg" onClick={addMore}>
            + Add more products
          </Button>
        </div>
        {lines.length > 0 && (
          <div className="space-y-2 border-t border-line pt-3">
            <p className="text-xs text-muted">Weighing up brands? Save this as an option, change brands, save again — then compare them side by side.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="secondary" onClick={saveOption}>
                Save as option
              </Button>
              <Button as="a" href="/compare/quotes" size="sm" variant="secondary">
                Compare quotations
              </Button>
            </div>
            {savedAs && (
              <p role="status" className="text-xs font-semibold text-emerald-700">
                Saved “{savedAs}” · {savedCount} saved
              </p>
            )}
          </div>
        )}
        {lines.length > 0 && (
          <div className="flex justify-between border-t border-line pt-3">
            <Button size="sm" variant="ghost" onClick={onCompare}>
              Compare brands
            </Button>
            <Button size="sm" variant="danger" onClick={onClear}>
              Clear quote
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
