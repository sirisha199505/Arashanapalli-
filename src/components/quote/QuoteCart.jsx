import { useMemo, useRef, useState } from 'react';
import { Button, Card, Icon } from '../ui';
import CategoryAccordion from './CategoryAccordion';
import ProductSearch from './ProductSearch';
import QuoteLineRow from './QuoteLineRow';
import TotalsSummary from './TotalsSummary';
import { PRODUCTS } from '../../data/catalog';
import { getCategories, getCategoryIcon } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const CATEGORIES = getCategories();
const CATEGORY_COUNTS = PRODUCTS.reduce((counts, p) => ({ ...counts, [p.category]: (counts[p.category] ?? 0) + 1 }), {});

/**
 * Step 1, full page (Swiggy style): left = categories as dropdowns of their products; middle = search + your items;
 * right = totals, "Proceed to quote", "Add more products", compare and clear.
 */
export default function QuoteCart({ quote, onSetItemBrand, onSetQuantity, onRemove, onProceed, onCompare, onClear }) {
  const { brand, brands, allBranded, lines, sections, totals } = quote;
  // which category dropdown is open — the first one when the quote is empty, so products are right there
  const [open, setOpen] = useState(() => (lines.length ? null : CATEGORIES[0]));
  const leftRef = useRef(null);
  const qty = useMemo(() => Object.fromEntries(lines.map((l) => [l.product.id, l.quantity])), [lines]);
  const inQuote = useMemo(() => Object.fromEntries(sections.map((s) => [s.category, s.lines.length])), [sections]);
  const addMore = () => {
    setOpen((o) => o ?? CATEGORIES[0]);
    leftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)] lg:grid-cols-[17rem_minmax(0,1fr)_20rem] lg:items-start">
      {/* left: categories — each opens into its products */}
      <aside ref={leftRef} className="scroll-mt-24">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink/70">Categories</h2>
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
      </aside>

      {/* middle: search + your items */}
      <div className="min-w-0 space-y-4">
        <ProductSearch brand={brand} qty={qty} onAdd={(id) => onSetQuantity(id, (qty[id] ?? 0) + 1)} />
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
            <p className="py-10 text-center text-sm text-ink/70">Your quote is empty — open a category on the left and tap ADD, or search above.</p>
          )}
        </Card>
      </div>

      {/* right: totals and next steps (brand for all items is chosen top right; each item can override it) */}
      <Card as="aside" className="space-y-4 p-4 sm:p-5 md:col-span-2 lg:sticky lg:top-24 lg:col-span-1">
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
