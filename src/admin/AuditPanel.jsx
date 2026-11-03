import { useState } from 'react';
import { Badge, Card, EmptyState } from '../components/ui';
import { ErrorNote, Pager } from './fields';
import useAsync, { useDebounced } from './useAsync';

const PAGE_SIZE = 50;
const TYPES = [
  { value: '', label: 'Everything' },
  { value: 'quote', label: 'Quotations' },
  { value: 'order', label: 'Orders' },
  { value: 'product', label: 'Products' },
  { value: 'brand', label: 'Brands' },
  { value: 'category', label: 'Categories' },
  { value: 'user', label: 'Staff' },
];
// one entry's type, e.g. "Product", "Category"
const SINGULAR = { quote: 'Quotation', order: 'Order', product: 'Product', brand: 'Brand', category: 'Category', user: 'Staff' };
const ACTION = { created: 'Created', updated: 'Updated', bulk_updated: 'Bulk update', imported: 'Imported', new_version: 'New version', follow_up: 'Follow-up', accepted: 'Accepted', hidden: 'Hidden' };
const label = (key) => key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const show = (v) => (v === null || v === undefined || v === '' ? '—' : typeof v === 'boolean' ? (v ? 'yes' : 'no') : Array.isArray(v) ? v.join(', ') : String(v));

// "Base price: 95 → 90", "Door Hinges: brand Godrej → Hettich"
const describe = (changes = {}) => [
  ...(changes.lines ?? []).map((c) => (c.from === undefined ? `${c.product}: ${c.change}${c.to ? ` (${c.to})` : ''}` : `${c.product}: ${c.change} ${show(c.from)} → ${show(c.to)}`)),
  ...Object.entries(changes)
    .filter(([k]) => k !== 'lines')
    .map(([k, [from, to]]) => `${label(k)}: ${show(from)} → ${show(to)}`),
];

/** Admin: the full audit trail — who changed what, when — for accountability on prices, brands, statuses and roles. */
export default function AuditPanel({ api, initial = {} }) {
  // batch_id: one bulk update's entries (opened from Bulk update, or "Whole batch" on an entry)
  const [filters, setFilters] = useState({ entity_type: '', search: '', from: '', to: '', batch_id: initial.batch_id ?? '' });
  const [page, setPage] = useState(1);
  const search = useDebounced(filters.search);
  const { result, error, loading } = useAsync(
    () => api.audit({ entity_type: filters.entity_type, search, from: filters.from, to: filters.to, batch_id: filters.batch_id, page, page_size: PAGE_SIZE }),
    [api, filters.entity_type, search, filters.from, filters.to, filters.batch_id, page],
  );
  const entries = result?.data ?? [];
  const set = (key) => (e) => (setFilters((f) => ({ ...f, [key]: e.target.value })), setPage(1));
  const setBatch = (batch_id) => (setFilters((f) => ({ ...f, batch_id })), setPage(1));
  const input = 'rounded-lg border border-line bg-surface px-2.5 py-2 text-sm outline-none focus:border-primary';

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-2 p-3">
        <label className="min-w-56 flex-1">
          <span className="mb-1 block text-[11px] font-medium text-muted">Search</span>
          <input type="search" aria-label="Search the audit log" placeholder="Quotation ID, product code, person, note" value={filters.search} onChange={set('search')} className={`${input} w-full`} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-muted">Type</span>
          <select aria-label="Type" value={filters.entity_type} onChange={set('entity_type')} className={input}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-muted">From</span>
          <input type="date" aria-label="From date" value={filters.from} onChange={set('from')} className={input} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-muted">To</span>
          <input type="date" aria-label="To date" value={filters.to} onChange={set('to')} className={input} />
        </label>
        {filters.batch_id && (
          <p className="flex basis-full items-center gap-2 text-sm">
            Showing one bulk update{result ? ` · ${result.total} product${result.total === 1 ? '' : 's'}` : ''}
            <button className="font-semibold text-primary hover:underline" onClick={() => setBatch('')}>
              Show everything
            </button>
          </p>
        )}
      </Card>

      <ErrorNote error={error} />
      {!loading && !entries.length && !error && <EmptyState title="Nothing recorded" message="Changes to quotations, orders, prices and staff appear here." />}
      {entries.length > 0 && (
        <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Who</th>
                <th className="px-4 py-2 font-medium">What</th>
                <th className="px-4 py-2 font-medium">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {entries.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted">{new Date(a.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2.5">{a.user_name}</td>
                  <td className="px-4 py-2.5">
                    <Badge>{SINGULAR[a.entity_type] ?? a.entity_type}</Badge>{' '}
                    <span className="font-semibold">{ACTION[a.action] ?? a.action}</span>
                    <span className="block font-mono text-xs text-muted">{a.ref}</span>
                    {a.note && <span className="block text-xs text-ink/80">{a.note}</span>}
                    {a.batch_id && !filters.batch_id && (
                      <button className="text-xs font-semibold text-primary hover:underline" onClick={() => setBatch(a.batch_id)}>
                        Whole batch
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {describe(a.changes).map((d) => (
                      <p key={d}>{d}</p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Pager page={page} totalPages={result?.total_pages ?? 1} onChange={setPage} />
    </div>
  );
}
