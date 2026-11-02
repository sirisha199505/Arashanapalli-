import { useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/format';
import { buildQuote } from '../../utils/quote';
import { MAX_COMPARE_QUOTES, compareQuotations, suggestQuotations } from '../../utils/quoteCompare';
import { Button, Card, EmptyState, Icon } from '../ui';
import CompareTabs from './CompareTabs';
import ComparisonSummary from './ComparisonSummary';

const CURRENT = 'current';

/**
 * /compare/quotes: compare up to 4 quotations — the current quote, saved ones and ready-made alternatives for the
 * same items — on price, benefits, quality, savings and support, then use the chosen one.
 */
export default function QuoteComparePage({ state, saved, onSave, onRemoveSaved, onUse, onBack }) {
  const current = state.items.length ? { id: CURRENT, name: 'Your current quote', ...state } : null;
  const suggestions = useMemo(() => suggestQuotations(state.items), [state.items]);
  const all = [current, ...saved, ...suggestions].filter(Boolean);

  // start with the current quote, then saved ones, then suggestions — up to 4
  const [picked, setPicked] = useState(() => all.slice(0, Math.min(MAX_COMPARE_QUOTES, current && !saved.length ? 3 : MAX_COMPARE_QUOTES)).map((q) => q.id));
  const [name, setName] = useState('');
  const selected = picked.map((id) => all.find((q) => q.id === id)).filter(Boolean);
  const results = compareQuotations(selected);

  const toggle = (id) => setPicked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < MAX_COMPARE_QUOTES ? [...ids, id] : ids));
  const save = (e) => {
    e.preventDefault();
    const q = onSave(name);
    setName('');
    setPicked((ids) => (ids.length < MAX_COMPARE_QUOTES ? [...ids, q.id] : ids));
  };

  const option = (q, extra) => {
    const checked = picked.includes(q.id);
    const total = buildQuote(q).totals.total;
    return (
      <li key={q.id} className="flex items-start gap-2 py-2">
        <input
          type="checkbox"
          id={`cmp-${q.id}`}
          checked={checked}
          disabled={!checked && picked.length >= MAX_COMPARE_QUOTES}
          onChange={() => toggle(q.id)}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <label htmlFor={`cmp-${q.id}`} className="min-w-0 flex-1 cursor-pointer text-sm">
          <span className="block font-medium leading-snug">{q.name}</span>
          <span className="block text-xs text-muted">
            {formatCurrency(total)} · {q.items.length} item{q.items.length === 1 ? '' : 's'}
            {q.savedAt && ` · saved ${new Date(q.savedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
          </span>
        </label>
        {extra}
      </li>
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-[calc(var(--header-h)+1.5rem)] sm:pb-14">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-primary">
        <Icon name="arrow" className="h-4 w-4 rotate-180" /> Back
      </button>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Compare quotations</h1>
          <p className="mt-1 text-sm text-muted">See the pros and cons of each option on price, benefits, quality, savings and support — then pick one.</p>
        </div>
        <CompareTabs path="/compare/quotes" />
      </div>

      {!all.length ? (
        <Card>
          <EmptyState
            title="Nothing to compare yet"
            message="Add products to your quote — then save it as an option, or compare it with suggested alternatives."
            action={<Button as="a" href="/products">Browse products</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-semibold">
                Choose up to {MAX_COMPARE_QUOTES} <span className="font-normal text-muted">({picked.length} selected)</span>
              </h2>
              {current && (
                <>
                  <h3 className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Current</h3>
                  <ul>{option(current)}</ul>
                  <form onSubmit={save} className="mt-1 flex gap-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={`Option ${saved.length + 1}`}
                      aria-label="Name for the saved quotation"
                      className="min-w-0 flex-1 rounded-lg border border-line px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      Save as option
                    </Button>
                  </form>
                </>
              )}
              {saved.length > 0 && (
                <>
                  <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Saved quotations</h3>
                  <ul className="divide-y divide-line">
                    {saved.map((q) =>
                      option(
                        q,
                        <button
                          type="button"
                          onClick={() => (onRemoveSaved(q.id), setPicked((ids) => ids.filter((x) => x !== q.id)))}
                          aria-label={`Delete ${q.name}`}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted hover:bg-surface-2 hover:text-primary"
                        >
                          <Icon name="close" className="h-3.5 w-3.5" />
                        </button>,
                      ),
                    )}
                  </ul>
                </>
              )}
              {suggestions.length > 0 && (
                <>
                  <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Suggested for your items</h3>
                  <ul className="divide-y divide-line">{suggestions.map((q) => option(q))}</ul>
                </>
              )}
            </Card>
          </aside>

          <section className="min-w-0">
            {selected.length ? (
              <ComparisonSummary
                results={results}
                title="Quotations"
                renderAction={(r) =>
                  r.quotation.id === CURRENT ? (
                    <p className="text-xs font-semibold text-muted">This is your current quote</p>
                  ) : (
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => onUse(r.quotation)}>
                      Use this quotation
                    </Button>
                  )
                }
              />
            ) : (
              <Card>
                <EmptyState title="Choose quotations" message="Tick up to 4 quotations on the left to compare them." />
              </Card>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
