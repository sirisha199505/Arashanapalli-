import { useState } from 'react';
import { Badge, Button, Card, EmptyState } from '../components/ui';
import { formatCurrency } from '../utils/format';
import { ErrorNote, Pager } from './fields';
import useAsync, { useDebounced } from './useAsync';
import { IN_PROGRESS, statusOf } from '../utils/quoteStatus';

const PAGE_SIZE = 25;
const today = () => new Date().toISOString().slice(0, 10);
const shortDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');

// tabs across the top (like an orders view), each a preset of filters, with its count from the server
const TABS = [
  { id: 'all', label: 'All', filters: {} },
  { id: 'draft', label: 'Draft', filters: { status: 'draft' } },
  { id: 'not_contacted', label: 'Not contacted', filters: { status: 'in_progress', contacted: 'false' } },
  { id: 'contacted', label: 'Contacted', filters: { status: 'contacted' } },
  { id: 'follow_up_due', label: 'Follow-up due', filters: { follow_up: 'due' } },
  { id: 'expiring', label: 'Expiring soon', filters: { validity: 'expiring' } },
  { id: 'expired', label: 'Expired', filters: { validity: 'expired' } },
  { id: 'accepted', label: 'Accepted', filters: { status: 'accepted' } },
  { id: 'lost', label: 'Lost', filters: { status: 'lost' } },
];
const SOURCES = { online: 'Online', walk_in: 'Walk-in', phone: 'Phone', whatsapp: 'WhatsApp' };

const EMPTY = { search: '', source: '', customer_type: '', contacted: '', validity: '', from: '', to: '', assigned_to: '' };

// links from elsewhere (dashboard, customers) arrive as { status, search, … }; map the old "new" to "not contacted"
const tabFor = (initial) =>
  initial.tab ?? (initial.status === 'new' ? 'not_contacted' : (TABS.find((t) => t.filters.status === initial.status && !t.filters.contacted)?.id ?? 'all'));

/** Quotations, newest first — the latest version of each — with tabs and filters on top and a quick "contacted" switch. */
export default function QuotesPanel({ api, session, initial = {}, onNavigate }) {
  const limited = session?.role === 3; // Limited sales only ever see their own quotations
  const staff = useAsync(() => (limited ? Promise.resolve([]) : api.staff()), [api]).result ?? [];
  const [tab, setTab] = useState(() => tabFor(initial));
  const [filters, setFilters] = useState({ ...EMPTY, search: initial.search ?? '' });
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState(null);
  const search = useDebounced(filters.search);
  // the tab's preset, then any filter chosen below (a chosen filter wins; empty ones leave the preset)
  const chosen = Object.fromEntries(Object.entries({ ...filters, search }).filter(([, v]) => v !== ''));
  const params = { ...TABS.find((t) => t.id === tab).filters, ...chosen, page, page_size: PAGE_SIZE };

  const { result, error, loading, reload } = useAsync(() => api.quotes.list(params), [api, tab, search, filters.source, filters.customer_type, filters.contacted, filters.validity, filters.from, filters.to, filters.assigned_to, page]);
  const quotes = result?.data ?? [];
  const counts = result?.counts ?? {};
  const set = (key) => (e) => (setFilters((f) => ({ ...f, [key]: e.target.value })), setPage(1));
  const filtered = Object.entries(filters).some(([, v]) => v);

  const toggleContacted = async (q) => {
    setActionError(null);
    try {
      await api.quotes.update(q.id, { contacted: !q.contacted });
      reload();
    } catch (err) {
      setActionError(err);
    }
  };

  const select = 'rounded-lg border border-line bg-surface px-2.5 py-2 text-sm outline-none focus:border-primary';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Quotation views" className="-mb-px flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => (setTab(t.id), setPage(1))}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-primary text-white' : 'text-ink/70 hover:bg-surface hover:text-ink'}`}
            >
              {t.label}
              {counts[t.id] !== undefined && <span className={`ml-1.5 rounded-full px-1.5 text-xs ${tab === t.id ? 'bg-white/20' : 'bg-surface-2'}`}>{counts[t.id]}</span>}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => onNavigate('/admin/quotes/new')}>
          + New quotation
        </Button>
      </div>

      <Card className="flex flex-wrap items-end gap-2 p-3">
        <label className="min-w-56 flex-1">
          <span className="mb-1 block text-[11px] font-medium text-muted">Search</span>
          <input
            type="search"
            value={filters.search}
            onChange={set('search')}
            placeholder="Quotation ID, phone, name or company"
            aria-label="Search quotations"
            className={`${select} w-full`}
          />
        </label>
        <Filter label="Contacted">
          <select aria-label="Contacted" value={filters.contacted} onChange={set('contacted')} className={select}>
            <option value="">Any</option>
            <option value="true">Contacted</option>
            <option value="false">Not contacted</option>
          </select>
        </Filter>
        <Filter label="Validity">
          <select aria-label="Validity" value={filters.validity} onChange={set('validity')} className={select}>
            <option value="">Any</option>
            <option value="valid">Valid</option>
            <option value="expiring">Expiring in 3 days</option>
            <option value="expired">Expired</option>
          </select>
        </Filter>
        <Filter label="Source">
          <select aria-label="Source" value={filters.source} onChange={set('source')} className={select}>
            <option value="">Any</option>
            {Object.entries(SOURCES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </Filter>
        <Filter label="Customer">
          <select aria-label="Customer type" value={filters.customer_type} onChange={set('customer_type')} className={select}>
            <option value="">B2B + B2C</option>
            <option value="B2B">Business (B2B)</option>
            <option value="B2C">Retail (B2C)</option>
          </select>
        </Filter>
        {staff.length > 0 && (
          <Filter label="Salesperson">
            <select aria-label="Salesperson" value={filters.assigned_to} onChange={set('assigned_to')} className={select}>
              <option value="">Anyone</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </Filter>
        )}
        <Filter label="From">
          <input type="date" aria-label="From date" value={filters.from} max={filters.to || today()} onChange={set('from')} className={select} />
        </Filter>
        <Filter label="To">
          <input type="date" aria-label="To date" value={filters.to} min={filters.from || undefined} max={today()} onChange={set('to')} className={select} />
        </Filter>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => (setFilters(EMPTY), setPage(1))}>
            Clear
          </Button>
        )}
      </Card>

      <ErrorNote error={error ?? actionError} />
      {!loading && !quotes.length && !error && <EmptyState title="No quotations" message={filtered || tab !== 'all' ? 'Nothing matches these filters.' : 'Quotations customers send — and ones you create — appear here.'} />}

      {quotes.length > 0 && (
        <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[64rem] text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Quotation ID</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Contacted</th>
                <th className="px-4 py-2 font-medium">Valid until</th>
                <th className="px-4 py-2 font-medium">Follow-up</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quotes.map((q) => {
                const overdue = IN_PROGRESS.includes(q.status) && q.follow_up_on && q.follow_up_on <= today();
                return (
                  <tr key={q.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-2.5">
                      <button onClick={() => onNavigate(`/admin/quotes/${q.id}`)} className="font-mono text-xs font-semibold text-primary hover:underline">
                        {q.quote_number}
                      </button>
                      <span className="block text-[11px] text-muted">
                        {SOURCES[q.source] ?? q.source}
                        {q.version_count > 1 && ` · ${q.version_count} versions`}
                        {q.assigned_name && ` · ${q.assigned_name}`}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">{shortDate(q.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <span className="block font-medium">
                        {q.customer_name}
                        {q.customer_type === 'B2B' && <Badge className="ml-1.5">B2B</Badge>}
                      </span>
                      <span className="block text-xs text-muted">
                        +91 {q.customer_phone}
                        {q.company_name && ` · ${q.company_name}`}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold">
                      {formatCurrency(q.total ?? 0)}
                      <span className="block text-[11px] font-normal text-muted">{(q.items ?? []).length} items</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={statusOf(q).tone}>{statusOf(q).label}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        role="switch"
                        aria-checked={q.contacted}
                        onClick={() => toggleContacted(q)}
                        aria-label={`${q.quote_number}: ${q.contacted ? 'contacted' : 'not contacted'}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${q.contacted ? 'bg-emerald-600/10 text-emerald-700' : 'bg-amber-500/15 text-amber-800'}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${q.contacted ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                        {q.contacted ? 'Contacted' : 'Not contacted'}
                      </button>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-2.5 ${q.expired ? 'text-primary' : 'text-muted'}`}>{shortDate(q.valid_until)}</td>
                    <td className={`whitespace-nowrap px-4 py-2.5 ${overdue ? 'font-semibold text-primary' : 'text-muted'}`}>{q.follow_up_on ? shortDate(q.follow_up_on) : '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => onNavigate(`/admin/quotes/${q.id}`)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Pager page={page} totalPages={result?.total_pages ?? 1} onChange={setPage} />
    </div>
  );
}

function Filter({ label, children }) {
  return (
    <label>
      <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
