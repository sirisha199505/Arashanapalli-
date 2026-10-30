import { useState } from 'react';
import { Badge, Button, Card, Chip, EmptyState } from '../components/ui';
import { formatCurrency } from '../utils/format';
import { ErrorNote, Pager, SelectField, TextAreaField } from './fields';
import useAsync, { useDebounced } from './useAsync';

const STATUSES = ['new', 'contacted', 'won', 'lost'];
const STATUS_TONE = { new: 'primary', contacted: 'neutral', won: 'success', lost: 'neutral' };
const PAGE_SIZE = 20;

const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Quote requests customers sent from the website, newest first. */
export default function QuotesPanel({ api, initial = {} }) {
  const [status, setStatus] = useState(initial.status ?? '');
  const [search, setSearch] = useState(initial.search ?? '');
  const [page, setPage] = useState(1);
  const query = useDebounced(search);
  const { result, error, loading, reload } = useAsync(
    () => api.quotes.list({ status, search: query, page, page_size: PAGE_SIZE }),
    [api, status, query, page],
  );
  const quotes = result?.data ?? [];

  const filter = (patch) => {
    if ('status' in patch) setStatus(patch.status);
    if ('search' in patch) setSearch(patch.search);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={!status} onClick={() => filter({ status: '' })}>
          All
        </Chip>
        {STATUSES.map((s) => (
          <Chip key={s} active={status === s} onClick={() => filter({ status: s })}>
            {s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
        <input
          type="search"
          placeholder="Search name or phone"
          aria-label="Search quote requests"
          value={search}
          onChange={(e) => filter({ search: e.target.value })}
          className="ml-auto w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
        />
      </div>

      <ErrorNote error={error} />
      {!loading && !quotes.length && !error && <EmptyState title="No quote requests" message="Quotes customers send from the website will appear here." />}

      <div className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
        {quotes.map((q) => (
          <QuoteCard key={q.id} quote={q} api={api} onSaved={reload} />
        ))}
      </div>

      <Pager page={page} totalPages={result?.total_pages ?? 1} onChange={setPage} />
    </div>
  );
}

function QuoteCard({ quote, api, onSaved }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ status: quote.status, notes: quote.notes ?? '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const changed = draft.status !== quote.status || draft.notes !== (quote.notes ?? '');
  const items = quote.items ?? [];

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.quotes.update(quote.id, draft);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-left">
        <span className="font-semibold">{quote.customer_name}</span>
        <a href={`tel:${quote.customer_phone}`} onClick={(e) => e.stopPropagation()} className="text-sm text-primary hover:underline">
          +91 {quote.customer_phone}
        </a>
        {quote.customer_city && <span className="text-sm text-muted">{quote.customer_city}</span>}
        <span className="ml-auto flex items-center gap-3">
          <Badge tone={STATUS_TONE[quote.status]}>{quote.status}</Badge>
          <span className="font-semibold">{formatCurrency(quote.total ?? 0)}</span>
        </span>
        <span className="w-full text-xs text-muted">
          {quote.quote_number} · {formatDateTime(quote.created_at)} · {items.length} item{items.length === 1 ? '' : 's'}
          {quote.sent_via && ` · via ${quote.sent_via}`}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="py-1 font-medium">Product</th>
                  <th className="py-1 font-medium">Brand</th>
                  <th className="py-1 text-right font-medium">Qty</th>
                  <th className="py-1 text-right font-medium">Rate</th>
                  <th className="py-1 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-1.5">{item.product_name}</td>
                    <td className="py-1.5">{item.brand_name ?? '—'}</td>
                    <td className="py-1.5 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-1.5 text-right">{item.unit_price == null ? 'Not available' : formatCurrency(item.unit_price)}</td>
                    <td className="py-1.5 text-right">{item.amount == null ? '—' : formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-right">
                <tr>
                  <td colSpan={4} className="pt-2 text-muted">Subtotal</td>
                  <td className="pt-2">{formatCurrency(quote.subtotal ?? 0)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-muted">GST</td>
                  <td>{formatCurrency(quote.gst ?? 0)}</td>
                </tr>
                <tr className="font-semibold">
                  <td colSpan={4}>Total</td>
                  <td>{formatCurrency(quote.total ?? 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
            <SelectField
              id={`status-${quote.id}`}
              label="Status"
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              options={STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
            />
            <TextAreaField id={`notes-${quote.id}`} label="Notes" rows={2} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
          </div>
          <ErrorNote error={error} />
          <div className="flex justify-end">
            <Button size="sm" onClick={save} disabled={!changed || saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
