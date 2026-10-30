import { useState } from 'react';
import { Button, Card, EmptyState } from '../components/ui';
import { formatCurrency } from '../utils/format';
import { ErrorNote, Pager } from './fields';
import useAsync, { useDebounced } from './useAsync';

const PAGE_SIZE = 25;
const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/** Everyone who has asked for a quote, one row per mobile number. */
export default function CustomersPanel({ api, onNavigate }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const query = useDebounced(search);
  const { result, error, loading } = useAsync(() => api.customers.list({ search: query, page, page_size: PAGE_SIZE }), [api, query, page]);
  const customers = result?.data ?? [];

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search name, mobile or city"
        aria-label="Search customers"
        value={search}
        onChange={(e) => (setSearch(e.target.value), setPage(1))}
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary sm:w-72"
      />
      <ErrorNote error={error} />
      {!loading && !customers.length && !error && <EmptyState title="No customers yet" message="Customers appear here once they send a quote request." />}
      {customers.length > 0 && (
        <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Mobile</th>
                <th className="px-4 py-2 font-medium">City</th>
                <th className="px-4 py-2 text-right font-medium">Quotes</th>
                <th className="px-4 py-2 text-right font-medium">Quoted value</th>
                <th className="px-4 py-2 text-right font-medium">Won value</th>
                <th className="px-4 py-2 font-medium">Last quote</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c) => (
                <tr key={c.customer_phone}>
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5">
                    <a href={`tel:+91${c.customer_phone}`} className="text-primary hover:underline">
                      +91 {c.customer_phone}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{c.city || '—'}</td>
                  <td className="px-4 py-2.5 text-right">{c.quotes}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(c.total_value)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(c.won_value)}</td>
                  <td className="px-4 py-2.5 text-muted">{formatDate(c.last_quote_at)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/quotes', { search: c.customer_phone })}>
                      View quotes
                    </Button>
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
