import { useState } from 'react';
import { navigate } from '../../hooks/useRoute';
import { Button, Card, EmptyState, Icon } from '../ui';
import BrandDropdown from './BrandDropdown';
import QuoteLineRow from './QuoteLineRow';
import TotalsSummary from './TotalsSummary';
import { getCategoryIcon, shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

/**
 * Step 1: the products chosen on the Products page — brand for all items (or per item), quantities —
 * and on the right the totals, "Proceed to quote", "Add more products" (back to the Products page), compare and clear.
 */
export default function QuoteCart({ quote, savedCount, onSaveQuotation, onSetBrand, onSetItemBrand, onSetQuantity, onRemove, onProceed, onCompare, onClear }) {
  const { brand, brands, allBranded, lines, sections, totals } = quote;
  const [savedAs, setSavedAs] = useState(null); // name of the option just saved
  const saveOption = () => setSavedAs(onSaveQuotation(`Option ${savedCount + 1} – ${brands.map(shortBrandName).join(', ') || 'brands not chosen'}`).name);
  const addMore = () => navigate('/products');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      {/* middle: your items */}
      <div className="min-w-0 space-y-4">
        <Card className="p-4 sm:p-5">
          {/* brand for every item, right where the items are; each item can still override it */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold">
              Your items <span className="text-sm font-medium text-ink/70">({lines.length})</span>
            </h2>
            <div className="w-full sm:w-72">
              <BrandDropdown options={quote.brandOptions} selectedId={brand?.id} mixed={brands.length > 1} onSelect={onSetBrand} />
            </div>
          </div>
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
            <EmptyState
              title="No products selected yet"
              message="Choose products on the Products page — by brand, by product or as a package — then come back here to pick brands and send."
              action={<Button onClick={addMore}>Select products</Button>}
            />
          )}
        </Card>
      </div>

      {/* right: totals and next steps */}
      <Card as="aside" className="space-y-4 p-4 sm:p-5 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
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
              ? 'Select a brand next to “Your items” for everything, or choose a brand on each item to mix brands.'
              : 'Select products on the Products page first.'}
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
