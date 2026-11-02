import { useState } from 'react';
import { Badge, Card, Icon } from '../components/ui';
import { formatCurrency } from '../utils/format';
import { ErrorNote } from './fields';
import StatCard from './StatCard';
import useAsync from './useAsync';
import { statusOf } from '../utils/quoteStatus';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];
const count = (n) => n.toLocaleString('en-IN');

/** Headline numbers for the chosen period, plus the latest quote requests. */
export default function DashboardPanel({ api, onNavigate }) {
  const [period, setPeriod] = useState('today');
  const { result: d, error, loading } = useAsync(() => api.dashboard(period), [api, period]);
  const openQuotes = (initial) => onNavigate('/admin/quotes', initial);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Icon name="calendar" className="h-5 w-5 text-muted" />
        <select
          aria-label="Period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-primary"
        >
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">IST</span>
      </div>

      <ErrorNote error={error} />
      {!d && loading && <p className="text-sm text-muted">Loading the numbers…</p>}

      {d?.awaiting_reply > 0 && (
        <button
          type="button"
          onClick={() => openQuotes({ tab: 'not_contacted' })}
          className="flex w-full items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900 transition hover:bg-amber-100"
        >
          <Icon name="bell" className="h-5 w-5 shrink-0" />
          <span>
            <strong>{count(d.awaiting_reply)}</strong> open quotation{d.awaiting_reply === 1 ? ' has' : 's have'} not been contacted yet.{' '}
            <span className="font-semibold underline">Open them</span>
          </span>
        </button>
      )}

      {d && (
        <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
          <StatCard label="Total Quote Value" value={formatCurrency(d.quotes.value)} icon="rupee" />
          <StatCard label="Quote Requests" value={count(d.quotes.total)} icon="file" onClick={() => openQuotes({})} />
          <StatCard label="Accepted" value={count(d.quotes.accepted)} sub={`Value: ${formatCurrency(d.quotes.accepted_value)}`} icon="checkCircle" onClick={() => openQuotes({ status: 'accepted' })} />
          <StatCard label="Lost" value={count(d.quotes.lost)} icon="xCircle" onClick={() => openQuotes({ status: 'lost' })} />

          <StatCard label="Not contacted" value={count(d.quotes.not_contacted)} icon="clock" onClick={() => openQuotes({ tab: 'not_contacted' })} />
          <StatCard label="Contacted" value={count(d.quotes.contacted)} icon="phone" />
          <StatCard label="Via WhatsApp" value={count(d.channels.whatsapp.count)} sub={`Value: ${formatCurrency(d.channels.whatsapp.value)}`} icon="chat" />
          <StatCard label="Via Email" value={count(d.channels.email.count)} sub={`Value: ${formatCurrency(d.channels.email.value)}`} icon="mail" />

          <StatCard label="Customers" value={count(d.customers.total)} sub={`New: ${count(d.customers.new)}`} icon="users" onClick={() => onNavigate('/admin/customers')} />
          <StatCard label="Avg. Quote Value" value={formatCurrency(d.quotes.avg_value)} icon="trend" />
          <StatCard label="Follow-ups due" value={count(d.follow_ups_due)} sub="Today and overdue" icon="bell" onClick={() => openQuotes({ tab: 'follow_up_due' })} />
          <StatCard label="Expiring soon" value={count(d.expiring_soon)} sub="Validity ends within 3 days" icon="calendar" onClick={() => openQuotes({ tab: 'expiring' })} />
        </div>
      )}

      {d?.orders && (
        <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
          <StatCard label="Orders" value={count(d.orders.total)} sub={`${d.orders.conversion}% of quotations converted`} icon="checkCircle" onClick={() => onNavigate('/admin/orders')} />
          <StatCard label="Order value" value={formatCurrency(d.orders.value)} sub={`Received ${formatCurrency(d.orders.paid)}`} icon="rupee" />
          <StatCard label="Payment due" value={formatCurrency(d.orders.balance)} icon="clock" onClick={() => onNavigate('/admin/orders', { tab: 'unpaid' })} />
          <StatCard label="To deliver" value={count(d.orders.to_deliver)} sub="Confirmed, processing or ready" icon="box" onClick={() => onNavigate('/admin/orders', { tab: 'active' })} />
        </div>
      )}

      {d && (
        <Card className="overflow-x-auto">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Latest quotations</h2>
            <button type="button" onClick={() => openQuotes({})} className="text-sm font-semibold text-primary hover:underline">
              View all
            </button>
          </div>
          {d.recent.length ? (
            <table className="w-full min-w-[36rem] text-sm">
              <tbody className="divide-y divide-line">
                {d.recent.map((q) => (
                  <tr key={q.id}>
                    <td className="px-5 py-3 font-medium">{q.customer_name}</td>
                    <td className="px-5 py-3 text-muted">+91 {q.customer_phone}</td>
                    <td className="px-5 py-3 text-muted">{new Date(q.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-5 py-3">
                      <Badge tone={statusOf(q).tone}>{statusOf(q).label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{formatCurrency(q.total ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">No quote requests yet.</p>
          )}
        </Card>
      )}
    </div>
  );
}
