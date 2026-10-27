import { useState } from 'react';
import { Button, Icon } from '../ui';
import { BRAND_SPEC_FIELDS } from '../../data/catalog';
import { shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

/** Label + one cell per column. Phones show the label above the cells; wider screens use a left label column. */
function Row({ label, columns, children }) {
  return (
    <div className="border-b border-line py-3">
      <p className="mb-1.5 text-sm font-medium text-ink/70 md:hidden">{label}</p>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'var(--cols)' }}>
        <div className="hidden text-sm font-medium text-ink/70 md:block">{label}</div>
        {columns.map((col) => (
          <div key={col.brand.id} className="min-w-0 text-sm text-ink">
            {children(col)}
          </div>
        ))}
      </div>
    </div>
  );
}

const SectionTitle = ({ children }) => <h3 className="mt-8 pb-2 text-base font-semibold">{children}</h3>;

/** Side-by-side brand comparison (Apple / Amazon style): a column per brand with its total and add-to-quote, then aligned price and spec rows. */
export default function CompareTable({ comparison, onRemoveBrand, onAddToQuote }) {
  const { products, columns, cheapest } = comparison;
  const [onlyDiff, setOnlyDiff] = useState(false);
  // phones: one column per brand; md+: a label column first
  const vars = {
    '--t': `repeat(${columns.length}, minmax(0, 1fr))`,
    '--md': `9rem repeat(${columns.length}, minmax(0, 1fr))`,
  };

  // "Best value" = lowest total among brands that carry every selected product
  const complete = columns.filter((c) => c.available === products.length);
  const bestTotal = complete.length > 1 ? Math.min(...complete.map((c) => c.total)) : null;

  const specRows = BRAND_SPEC_FIELDS.filter((f) => !onlyDiff || new Set(columns.map((c) => c.brand.specs[f.key])).size > 1);

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4 sm:p-5 [--cols:var(--t)] md:[--cols:var(--md)]" style={vars}>
      <div className={columns.length > 2 ? 'min-w-[34rem]' : 'min-w-[18rem]'}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Comparison</h2>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            Only differences
          </label>
        </div>

        {/* brand column headers */}
        <div className="grid gap-4 border-b border-line pb-4" style={{ gridTemplateColumns: 'var(--cols)' }}>
          <div className="hidden md:block" />
          {columns.map(({ brand, total, available }) => {
            const best = bestTotal !== null && total === bestTotal && available === products.length;
            const missing = products.length - available;
            return (
              <div key={brand.id} className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold leading-tight">{shortBrandName(brand)}</p>
                    <p className="text-sm text-ink/70">
                      {brand.tier}
                      {best && <span className="font-semibold text-brand"> · Best value</span>}
                    </p>
                  </div>
                  <button type="button" onClick={() => onRemoveBrand(brand.id)} aria-label={`Remove ${brand.name}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink/60 hover:bg-surface-2 hover:text-ink">
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(total)}</p>
                  <p className="text-sm text-ink/70">{missing ? `${missing} item${missing === 1 ? '' : 's'} not available` : 'Total, 1 of each'}</p>
                </div>
                <Button size="sm" className="mt-auto w-full" disabled={!available} onClick={() => onAddToQuote(brand.id)}>
                  Add to quote
                </Button>
              </div>
            );
          })}
        </div>

        <SectionTitle>Price per unit (excl. GST)</SectionTitle>
        {products.map((product) => (
          <Row key={product.id} label={`${product.name} / ${product.unit}`} columns={columns}>
            {({ prices }) => {
              const price = prices[product.id];
              if (price === null) return <span className="text-ink/60">Not available</span>;
              const lowest = columns.length > 1 && price === cheapest[product.id];
              return (
                <span className={lowest ? 'font-semibold text-brand' : 'font-medium'}>
                  {formatCurrency(price)}
                  {lowest && <span className="font-normal"> · lowest</span>}
                </span>
              );
            }}
          </Row>
        ))}

        <SectionTitle>Specifications</SectionTitle>
        {specRows.length ? (
          specRows.map((field) => (
            <Row key={field.key} label={field.label} columns={columns}>
              {({ brand }) => brand.specs[field.key]}
            </Row>
          ))
        ) : (
          <p className="border-b border-line py-3 text-sm text-ink/70">These brands match on every specification.</p>
        )}
      </div>
    </div>
  );
}
