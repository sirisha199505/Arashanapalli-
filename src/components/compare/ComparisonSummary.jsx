import { Badge, Icon } from '../ui';

const TONE = {
  pro: { icon: 'checkCircle', className: 'text-emerald-700', label: 'Pro' },
  con: { icon: 'xCircle', className: 'text-primary', label: 'Con' },
};

const BADGE_TONE = { Recommended: 'solidPrimary', 'Best price': 'success', 'Longest warranty': 'success', 'Best quality': 'success' };

/** Why the recommended option wins, from its strongest points. */
const reason = (result) =>
  result.criteria
    .filter((c) => c.tone === 'pro')
    .map((c) => (c.key === 'savings' ? `saves ${c.value}` : c.key === 'price' ? 'lowest price' : c.note || c.value).toLowerCase())
    .slice(0, 3)
    .join(', ');

/**
 * Decision summary for compared options (quotations, or brands for the same items): a recommendation, then one column
 * per option and one row per criterion — price, benefits, quality, savings, support — each marked as a pro or a con.
 * `renderAction(result)` adds a button under each option's total.
 */
export default function ComparisonSummary({ results, renderAction, title = 'Decision summary' }) {
  const recommended = results.find((r) => r.badges.includes('Recommended'));
  // columns share the width (notes wrap); below ~11rem each the table scrolls sideways inside its box
  const columns = `9rem repeat(${results.length}, minmax(0, 1fr))`;
  const minWidth = `calc(9rem + ${results.length} * 11rem + ${results.length} * 1rem)`;

  return (
    <section aria-label={title} className="space-y-4">
      {recommended && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4">
          <Icon name="award" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <p className="text-sm">
            <span className="font-semibold">Recommended: {recommended.quotation.name}</span>
            {reason(recommended) && <span className="text-ink/80"> — {reason(recommended)}.</span>}
            <span className="block text-xs text-muted">Best balance of price (40%), quality (25%), warranty (20%) and support (15%).</span>
          </p>
        </div>
      )}

      {/* relative: keeps the screen-reader "Pro:"/"Con:" labels (absolutely positioned) inside the scroll box */}
      <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
        <div className="p-4 sm:p-5" style={{ minWidth }} role="table" aria-label={title}>
          {/* option headers */}
          <div role="row" className="grid gap-4 border-b border-line pb-4" style={{ gridTemplateColumns: columns }}>
            <div role="columnheader" className="text-lg font-bold">
              {title}
            </div>
            {results.map((r) => {
              const pros = r.criteria.filter((c) => c.tone === 'pro').length;
              const cons = r.criteria.filter((c) => c.tone === 'con').length;
              return (
                <div role="columnheader" key={r.quotation.id} className={`flex min-w-0 flex-col gap-2 rounded-xl p-3 ${r.badges.includes('Recommended') ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}>
                  <p className="font-semibold leading-snug">{r.quotation.name}</p>
                  {r.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.badges.map((b) => (
                        <Badge key={b} tone={BADGE_TONE[b] ?? 'neutral'}>
                          {b}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-2xl font-bold">
                    {r.criteria[0].value} <span className="text-xs font-medium text-muted">incl. GST</span>
                  </p>
                  <p className="text-xs text-muted">
                    <span className="font-semibold text-emerald-700">{pros} pro{pros === 1 ? '' : 's'}</span> ·{' '}
                    <span className="font-semibold text-primary">{cons} con{cons === 1 ? '' : 's'}</span> · {r.itemCount} item{r.itemCount === 1 ? '' : 's'}
                  </p>
                  {renderAction && <div className="mt-auto">{renderAction(r)}</div>}
                </div>
              );
            })}
          </div>

          {/* one row per criterion */}
          {results[0]?.criteria.map((criterion, row) => (
            <div role="row" key={criterion.key} className="grid gap-4 border-b border-line py-3 last:border-0" style={{ gridTemplateColumns: columns }}>
              <div role="rowheader" className="text-sm font-semibold text-ink/80">
                {criterion.label}
              </div>
              {results.map((r) => {
                const c = r.criteria[row];
                const tone = TONE[c.tone];
                return (
                  <div role="cell" key={r.quotation.id} className="flex min-w-0 gap-2 text-sm">
                    {tone ? (
                      <span className={tone.className} title={tone.label}>
                        <Icon name={tone.icon} className="mt-0.5 h-4 w-4" />
                        <span className="sr-only">{tone.label}: </span>
                      </span>
                    ) : (
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-line" aria-hidden="true" />
                    )}
                    <span className="min-w-0">
                      <span className="block font-semibold">{c.value}</span>
                      {c.note && <span className="block text-xs leading-snug text-muted">{c.note}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted">
        Prices include 18% GST. Warranty, guarantee and support come from each brand's details; quality reflects each brand's class (Premium / Standard / Economy), weighted by value.
      </p>
    </section>
  );
}
