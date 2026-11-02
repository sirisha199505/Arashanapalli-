import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal, TextField } from '../components/ui';
import { formatCurrency } from '../utils/format';
import { ErrorNote, Pager, SelectField, TextAreaField } from './fields';
import useAsync, { useDebounced } from './useAsync';

const PAGE_SIZE = 25;
const TABS = [
  { id: 'all', label: 'All', filters: {} },
  { id: 'active', label: 'Active', filters: { status: 'active' } },
  { id: 'delivered', label: 'Delivered', filters: { status: 'delivered' } },
  { id: 'cancelled', label: 'Cancelled', filters: { status: 'cancelled' } },
  { id: 'unpaid', label: 'Payment due', filters: { payment_status: 'unpaid' } },
];
export const ORDER_STATUSES = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready for pickup / delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
const STATUS_TONE = { confirmed: 'primary', processing: 'primary', ready: 'success', delivered: 'success', cancelled: 'neutral' };
const PAY_TONE = { unpaid: 'primary', partial: 'neutral', paid: 'success' };
const shortDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');

/** Orders made from accepted quotations — fulfilled offline: status, payment received and delivery date. */
export default function OrdersPanel({ api, initial = {}, onNavigate }) {
  const [tab, setTab] = useState(initial.tab ?? 'all');
  const [search, setSearch] = useState(initial.search ?? '');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const query = useDebounced(search);
  const { result, error, loading, reload } = useAsync(
    () => api.orders.list({ ...TABS.find((t) => t.id === tab).filters, search: query, page, page_size: PAGE_SIZE }),
    [api, tab, query, page],
  );
  const orders = result?.data ?? [];
  const counts = result?.counts ?? {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Order views" className="flex flex-1 gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => (setTab(t.id), setPage(1))}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${tab === t.id ? 'bg-primary text-white' : 'text-ink/70 hover:bg-surface hover:text-ink'}`}
            >
              {t.label}
              {counts[t.id] !== undefined && <span className={`ml-1.5 rounded-full px-1.5 text-xs ${tab === t.id ? 'bg-white/20' : 'bg-surface-2'}`}>{counts[t.id]}</span>}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => (setSearch(e.target.value), setPage(1))}
          placeholder="Order / quotation ID, phone, name"
          aria-label="Search orders"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary sm:w-72"
        />
      </div>
      <p className="text-xs text-muted">Orders come from accepted quotations — open a quotation and use “Convert to order”.</p>

      <ErrorNote error={error} />
      {!loading && !orders.length && !error && <EmptyState title="No orders" message="When a customer accepts a quotation, convert it to an order from the quotation page." />}
      {orders.length > 0 && (
        <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[60rem] text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
                <th className="px-4 py-2 text-right font-medium">Paid</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Delivery</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-2.5">
                    <span className="block font-mono text-xs font-semibold">{o.order_number}</span>
                    <button onClick={() => onNavigate(`/admin/quotes/${o.quote_id}`)} className="font-mono text-[11px] text-primary hover:underline">
                      {o.quote_number}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="block font-medium">{o.customer_name}</span>
                    <span className="text-xs text-muted">
                      +91 {o.customer_phone}
                      {o.company_name && ` · ${o.company_name}`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {formatCurrency(o.amount_paid)}
                    {o.balance > 0 && <span className="block text-[11px] text-primary">Due {formatCurrency(o.balance)}</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={PAY_TONE[o.payment_status]}>{o.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{shortDate(o.delivery_on)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(o)}>
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Pager page={page} totalPages={result?.total_pages ?? 1} onChange={setPage} />
      {editing && (
        <OrderForm
          order={editing}
          api={api}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function OrderForm({ order, api, onClose, onSaved }) {
  const [form, setForm] = useState({ status: order.status, amount_paid: order.amount_paid ?? 0, delivery_on: order.delivery_on ?? '', notes: order.notes ?? '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.orders.update(order.id, { ...form, amount_paid: Number(form.amount_paid) || 0, delivery_on: form.delivery_on || null });
      onSaved();
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={`Order ${order.order_number}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="order-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      }
    >
      <form id="order-form" onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">
          {order.customer_name} · {(order.items ?? []).length} items · total <strong className="text-ink">{formatCurrency(order.total)}</strong>
        </p>
        <SelectField id="o-status" label="Status" value={form.status} onChange={set('status')} options={ORDER_STATUSES} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="o-paid" label="Amount received (₹)" type="number" min="0" max={order.total} value={form.amount_paid} onChange={set('amount_paid')} hint={`Balance ${formatCurrency(Math.max(0, order.total - (Number(form.amount_paid) || 0)))}`} />
          <TextField id="o-delivery" label="Delivery / pickup date" type="date" value={form.delivery_on ?? ''} onChange={set('delivery_on')} />
        </div>
        <TextAreaField id="o-notes" label="Notes" value={form.notes} onChange={set('notes')} />
        <ErrorNote error={error} />
      </form>
    </Modal>
  );
}
