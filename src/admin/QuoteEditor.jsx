import { useEffect, useMemo, useState } from 'react';
import { COMPANY, PRODUCTS } from '../data/catalog';
import { Badge, Button, Card, Icon, TextField } from '../components/ui';
import { STOCK, dynamicCode, getBrand, getBrandDetails, getBrandsForProduct, getProduct, getUnitPrice, parseCode, searchCatalog } from '../utils/catalog';
import { formatCurrency } from '../utils/format';
import { quotationPdfUrl } from '../utils/api';
import { sharePdf, trackUrl } from '../utils/share';
import VersionCompare from '../components/compare/VersionCompare';
import { statusOf } from '../utils/quoteStatus';
import { CheckboxField, ErrorNote, SelectField, TextAreaField } from './fields';
import useAsync from './useAsync';

const GST_RATE = 0.18;
const STATUSES = [
  { value: 'draft', label: 'Draft — not shared yet' },
  { value: 'sent', label: 'Sent to customer' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'lost', label: 'Lost' },
];
const SOURCES = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'online', label: 'Online' },
];
const DETAIL_FIELDS = ['customer_name', 'customer_phone', 'customer_email', 'customer_city', 'company_name', 'gstin', 'status', 'contacted', 'follow_up_on', 'valid_until', 'notes', 'assigned_to'];
const EMPTY_DETAILS = { customer_name: '', customer_phone: '', customer_email: '', customer_city: '', company_name: '', gstin: '', status: 'draft', contacted: false, follow_up_on: '', valid_until: '', notes: '', source: 'walk_in', assigned_to: '' };
const LIMITED = 3; // Limited sales: list prices only, can't reassign
const ACTIONS = [
  { kind: 'call', label: 'Call', icon: 'phone' },
  { kind: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
  { kind: 'visit', label: 'Visit', icon: 'pin' },
  { kind: 'email', label: 'Email', icon: 'mail' },
  { kind: 'note', label: 'Note', icon: 'file' },
];
const KIND_LABEL = { call: 'Called', whatsapp: 'WhatsApp', visit: 'Visited', email: 'Emailed', note: 'Note', version: 'New version', status: 'Status', created: 'Created' };

let nextKey = 1;
// an editable line: product, brand, quantity, and an optional price override ('' = list price)
// … plus a benefits note (e.g. "Free fitting") and alternative brands to offer alongside
const toLine = (item) => ({
  key: nextKey++, product_id: item.product_id, brand_id: item.brand_id ?? '', quantity: item.quantity,
  unit_price: item.overridden ? String(item.unit_price) : '', list_price: item.list_price, note: item.note ?? '',
  benefits: item.benefits ?? '', alternative_brand_ids: (item.alternatives ?? []).map((a) => a.brand_id), name: item.product_name, unit: item.unit,
});
const listPrice = (line) => {
  const product = getProduct(line.product_id);
  const brand = getBrand(line.brand_id);
  return product && brand && product.brandIds.includes(brand.id) ? getUnitPrice(product, brand) : line.brand_id === line.saved_brand ? line.list_price : null;
};
const linesKey = (lines) =>
  JSON.stringify(lines.map(({ product_id, brand_id, quantity, unit_price, note, benefits, alternative_brand_ids }) => ({ product_id, brand_id, quantity: Number(quantity), unit_price, note, benefits, alternative_brand_ids })));
const AUDIT_ACTION = { created: 'Created', updated: 'Updated', new_version: 'New version', follow_up: 'Follow-up', accepted: 'Accepted' };
const fieldLabel = (key) => key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const show = (value) => (value === null || value === undefined || value === '' ? '—' : typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value));

/**
 * One quotation (/admin/quotes/<id>) or a new one (/admin/quotes/new): line items with brand swap and price override,
 * customer and B2B details, status, contacted, follow-up and validity. Changing items saves a new version (-00N).
 */
export default function QuoteEditor({ api, id, session, onNavigate }) {
  const isNew = id === 'new';
  const limited = session?.role === LIMITED;
  const lists = useAsync(() => Promise.all([api.templates.list().then((r) => r.data), limited ? Promise.resolve([]) : api.staff()]), [api]);
  const [packages, staff] = lists.result ?? [[], []];
  const loaded = useAsync(() => (isNew ? Promise.resolve(null) : api.quotes.get(id)), [api, id]);
  const quote = loaded.result;
  const [lines, setLines] = useState([]);
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [saving, setSaving] = useState(null); // 'details' | 'version' | 'create'
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // start from the loaded quotation
  useEffect(() => {
    if (!quote) return;
    setLines(quote.items.map((i) => ({ ...toLine(i), saved_brand: i.brand_id })));
    setDetails(Object.fromEntries(DETAIL_FIELDS.map((k) => [k, quote[k] ?? (k === 'contacted' ? false : '')])));
    setError(null);
  }, [quote]);

  const savedLinesKey = useMemo(() => (quote ? linesKey(quote.items.map(toLine)) : '[]'), [quote]);
  const linesChanged = linesKey(lines) !== savedLinesKey;
  const detailsChanged = quote && DETAIL_FIELDS.some((k) => String(details[k] ?? '') !== String(quote[k] ?? (k === 'contacted' ? false : '')));

  const priced = lines.map((l) => {
    const list = listPrice(l);
    const unit = l.unit_price !== '' ? Number(l.unit_price) : list;
    return { ...l, list, unit, amount: unit ? unit * Number(l.quantity || 0) : null };
  });
  const subtotal = priced.reduce((sum, l) => sum + (l.amount ?? 0), 0);
  const gst = Math.round(subtotal * GST_RATE);

  const setLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const addProduct = (product, brand, quantity = 1) => {
    setLines((ls) => {
      const existing = ls.find((l) => l.product_id === product.id);
      if (existing) return ls.map((l) => (l === existing ? { ...l, quantity: Number(l.quantity) + quantity, ...(brand && { brand_id: brand.id }) } : l));
      // brand: the one in a typed dynamic code, else the brand most lines already use (if it makes this product), else the cheapest
      const used = ls.map((l) => l.brand_id).filter(Boolean);
      const common = used.sort((a, b) => used.filter((x) => x === b).length - used.filter((x) => x === a).length)[0];
      const brands = getBrandsForProduct(product);
      const pick = brand ?? brands.find((b) => b.id === common) ?? brands.reduce((a, b) => (getUnitPrice(product, b) < getUnitPrice(product, a) ? b : a), brands[0]);
      return [...ls, { key: nextKey++, product_id: product.id, brand_id: pick?.id ?? '', quantity, unit_price: '', note: '', name: product.name, unit: product.unit }];
    });
  };
  // a saved package: each of its products (in its brand, if it names one) with its quantity
  const addPackage = (pkg) => pkg.items.forEach((i) => getProduct(i.product_id) && addProduct(getProduct(i.product_id), getBrand(i.brand_id), Number(i.quantity) || 1));
  const canEditPrices = isNew ? !limited : quote?.can_edit_prices !== false;

  const payloadItems = () =>
    lines.map((l) => ({
      product_id: l.product_id, brand_id: l.brand_id, quantity: Number(l.quantity),
      ...(l.unit_price !== '' && { unit_price: Number(l.unit_price) }), ...(l.note && { note: l.note }),
      ...(l.benefits?.trim() && { benefits: l.benefits.trim() }), ...(l.alternative_brand_ids?.length && { alternative_brand_ids: l.alternative_brand_ids }),
    }));
  // sharing a draft with the customer makes it "sent"
  const markSent = () => quote?.status === 'draft' && api.quotes.update(quote.id, { status: 'sent' }).then(loaded.reload, () => {});
  const detailPayload = () => {
    const data = { ...details, follow_up_on: details.follow_up_on || null, valid_until: details.valid_until || null, assigned_to: details.assigned_to || null };
    if (limited) delete data.assigned_to;
    return data;
  };

  const run = async (kind, action) => {
    setSaving(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(null);
    }
  };

  const saveDetails = () =>
    run('details', async () => {
      await api.quotes.update(quote.id, detailPayload());
      loaded.reload();
      setNotice('Details saved');
    });

  const saveVersion = () =>
    run('version', async () => {
      if (detailsChanged) await api.quotes.update(quote.id, detailPayload()); // the new version copies these
      const created = await api.quotes.revise(quote.id, { items: payloadItems(), notes: details.notes });
      onNavigate(`/admin/quotes/${created.id}`);
    });

  const convert = () => {
    if (!window.confirm(`Mark ${quote.quote_number} as accepted and create an order from it?`)) return;
    run('convert', async () => {
      await api.quotes.convert(quote.id);
      onNavigate('/admin/orders', { search: quote.quote_number });
    });
  };

  const create = () =>
    run('create', async () => {
      const created = await api.quotes.createStaff({ ...detailPayload(), items: payloadItems() });
      onNavigate(`/admin/quotes/${created.id}`);
    });

  if (loaded.error) return <ErrorNote error={loaded.error} />;
  if (!isNew && !quote) return <p className="text-sm text-muted">Loading…</p>;

  const set = (key) => (e) => setDetails((d) => ({ ...d, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const shareText = quote && `Dear ${quote.customer_name}, here is your quotation ${quote.quote_number} from ${COMPANY.name}: ${formatCurrency(quote.total)} incl. GST, valid until ${new Date(quote.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}. View it here: ${trackUrl(quote.quote_number)}`;

  return (
    <div className="space-y-5">
      <button onClick={() => onNavigate('/admin/quotes')} className="inline-flex items-center gap-1 text-sm font-semibold text-ink/70 hover:text-primary">
        <Icon name="chevronLeft" className="h-4 w-4" /> Quotations
      </button>

      {quote && (
        <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
          <div>
            <p className="text-xs text-muted">Quotation ID</p>
            <p className="font-mono text-xl font-bold tracking-wide">{quote.quote_number}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={statusOf(quote).tone}>{statusOf(quote).label}</Badge>
            <Badge>{SOURCES.find((s) => s.value === quote.source)?.label ?? quote.source}</Badge>
            {quote.customer_type === 'B2B' && <Badge>B2B</Badge>}
            <Badge tone={quote.contacted ? 'success' : 'neutral'}>{quote.contacted ? 'Contacted' : 'Not contacted'}</Badge>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button as="a" size="sm" variant="whatsapp" href={`https://wa.me/91${quote.customer_phone}?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" onClick={markSent}>
              <Icon name="chat" className="h-4 w-4" /> WhatsApp customer
            </Button>
            <Button as="a" size="sm" variant="secondary" href={quotationPdfUrl(quote.quote_number)} target="_blank" rel="noreferrer">
              <Icon name="file" className="h-4 w-4" /> PDF
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                markSent();
                sharePdf({ url: quotationPdfUrl(quote.quote_number), filename: `${quote.quote_number}.pdf`, text: shareText, phone: quote.customer_phone });
              }}
            >
              Share PDF
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(trackUrl(quote.quote_number)).then(() => (setNotice('Link copied'), markSent()))}>
              Copy link
            </Button>
            <Button as="a" size="sm" variant="ghost" href={`/track/${quote.quote_number}`} target="_blank" rel="noreferrer">
              View as customer
            </Button>
            {quote.order ? (
              <Button size="sm" variant="secondary" onClick={() => onNavigate('/admin/orders', { search: quote.order.order_number })}>
                Order {quote.order.order_number} · {quote.order.status}
              </Button>
            ) : (
              quote.status !== 'lost' && (
                <Button size="sm" onClick={convert} disabled={saving || linesChanged}>
                  Convert to order
                </Button>
              )
            )}
          </div>
          {quote.versions?.length > 1 && (
            <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-line pt-3 text-xs">
              <span className="font-semibold text-muted">Versions:</span>
              {quote.versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onNavigate(`/admin/quotes/${v.id}`)}
                  aria-current={v.id === quote.id ? 'page' : undefined}
                  className={`rounded-md px-2 py-1 font-mono font-semibold ring-1 ${v.id === quote.id ? 'bg-primary text-white ring-primary' : 'ring-line hover:ring-primary'}`}
                >
                  {v.quote_number} · {formatCurrency(v.total)}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {quote && quote.versions.length + (quote.related?.length ?? 0) > 1 && (
        <Card className="p-4">
          <VersionCompare
            key={quote.id}
            // its own versions, then the customer's other quotations
            versions={[...quote.versions, ...(quote.related ?? [])]}
            phone={quote.customer_phone}
            shareText={(ids) => `Dear ${quote.customer_name}, here is a comparison of your quotations ${ids.join(', ')} from ${COMPANY.name} — prices include GST.`}
          />
        </Card>
      )}

      {notice && (
        <p role="status" className="rounded-lg bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-800">
          {notice}
        </p>
      )}
      <ErrorNote error={error} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Items</h2>
            {!isNew && linesChanged && <span className="text-xs font-semibold text-amber-700">Items changed — save as a new version to keep the one already sent</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="min-w-64 flex-1">
              <AddProduct onAdd={addProduct} />
            </div>
            {packages.filter((t) => t.active).length > 0 && (
              <select
                aria-label="Add a package"
                value=""
                onChange={(e) => {
                  const pkg = packages.find((t) => String(t.id) === e.target.value);
                  if (pkg) addPackage(pkg);
                }}
                className="h-10 rounded-lg border border-line bg-surface px-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">+ Add a package…</option>
                {packages
                  .filter((t) => t.active)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.items.length} items)
                    </option>
                  ))}
              </select>
            )}
          </div>
          {!canEditPrices && <p className="mt-2 text-xs text-muted">Rates are list prices — only Sales or Admin can change them.</p>}
          {lines.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[46rem] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="py-2 pr-2 font-medium">Item</th>
                    <th className="py-2 pr-2 font-medium">Brand</th>
                    <th className="w-20 py-2 pr-2 font-medium">Qty</th>
                    <th className="w-32 py-2 pr-2 font-medium">Rate (₹)</th>
                    <th className="py-2 pr-2 text-right font-medium">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {priced.map((l) => {
                    const product = getProduct(l.product_id);
                    const brands = product ? getBrandsForProduct(product) : [];
                    return (
                      <tr key={l.key} className="align-top">
                        <td className="py-2 pr-2">
                          <p className="font-medium leading-snug">{product?.name ?? l.name}</p>
                          <p className="font-mono text-[11px] font-semibold text-muted">{product ? dynamicCode(product, getBrand(l.brand_id)) : l.product_id}</p>
                          <input
                            aria-label={`Benefits note for ${product?.name ?? l.name}`}
                            placeholder="Benefits note (e.g. free fitting)"
                            value={l.benefits ?? ''}
                            onChange={(e) => setLine(l.key, { benefits: e.target.value })}
                            disabled={!canEditPrices}
                            className="mt-1 w-full rounded-md border border-transparent bg-surface-2/60 px-2 py-1 text-xs outline-none placeholder:text-muted focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <select
                            aria-label={`Brand for ${product?.name ?? l.name}`}
                            value={l.brand_id}
                            onChange={(e) => setLine(l.key, { brand_id: e.target.value, unit_price: '' })}
                            className={`w-44 rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-primary ${l.list ? 'border-line' : 'border-primary/60 text-primary'}`}
                          >
                            {!l.list && <option value={l.brand_id}>Choose brand</option>}
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name} — {formatCurrency(getUnitPrice(product, b))}
                              </option>
                            ))}
                          </select>
                          {getBrand(l.brand_id)?.specs?.warranty && (
                            <p className="mt-1 text-[11px] text-muted">
                              Warranty {getBrand(l.brand_id).specs.warranty}
                              {getBrand(l.brand_id).specs.guarantee && ` · ${getBrand(l.brand_id).specs.guarantee}`}
                            </p>
                          )}
                          {product && getBrand(l.brand_id) && STOCK[getBrandDetails(product, getBrand(l.brand_id)).stock] && (
                            <p className="mt-0.5 text-[11px] font-semibold text-primary">{STOCK[getBrandDetails(product, getBrand(l.brand_id)).stock].label}</p>
                          )}
                          <Alternatives line={l} product={product} brands={brands} disabled={!canEditPrices} onChange={(ids) => setLine(l.key, { alternative_brand_ids: ids })} />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="1"
                            aria-label={`Quantity of ${product?.name ?? l.name}`}
                            value={l.quantity}
                            onChange={(e) => setLine(l.key, { quantity: e.target.value })}
                            className="w-full rounded-lg border border-line px-2 py-1.5 text-sm outline-none focus:border-primary"
                          />
                          <span className="text-[11px] text-muted">{product?.unit ?? l.unit}</span>
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="1"
                            aria-label={`Rate for ${product?.name ?? l.name}`}
                            placeholder={l.list ? String(l.list) : '—'}
                            value={l.unit_price}
                            disabled={!canEditPrices}
                            onChange={(e) => setLine(l.key, { unit_price: e.target.value })}
                            className={`w-full rounded-lg border px-2 py-1.5 text-sm outline-none focus:border-primary ${l.unit_price !== '' ? 'border-amber-500 bg-amber-50' : 'border-line'}`}
                          />
                          {l.unit_price !== '' ? (
                            <button onClick={() => setLine(l.key, { unit_price: '' })} className="text-[11px] font-semibold text-amber-700 hover:underline">
                              List {l.list ? formatCurrency(l.list) : '—'} · reset
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted">list price</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-2 text-right font-semibold">{l.amount ? formatCurrency(l.amount) : '—'}</td>
                        <td className="py-2 text-right">
                          <button onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} aria-label={`Remove ${product?.name ?? l.name}`} className="rounded p-1 text-muted hover:bg-surface-2 hover:text-primary">
                            <Icon name="close" className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted">Add products by name or code above.</p>
          )}

          <dl className="ml-auto mt-4 w-full max-w-xs space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">GST (18%)</dt>
              <dd>{formatCurrency(gst)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{formatCurrency(subtotal + gst)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {isNew ? (
              <Button onClick={create} disabled={!lines.length || saving}>
                {saving ? 'Creating…' : 'Create quotation'}
              </Button>
            ) : (
              <Button onClick={saveVersion} disabled={!linesChanged || !lines.length || saving}>
                {saving === 'version' ? 'Saving…' : 'Save as new version'}
              </Button>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-3 p-4">
            <h2 className="font-semibold">Customer</h2>
            <TextField id="q-name" label="Name *" value={details.customer_name} onChange={set('customer_name')} />
            <TextField id="q-phone" label="Mobile *" type="tel" value={details.customer_phone} onChange={set('customer_phone')} />
            <TextField id="q-email" label="Email" type="email" value={details.customer_email ?? ''} onChange={set('customer_email')} />
            <TextField id="q-city" label="City" value={details.customer_city ?? ''} onChange={set('customer_city')} />
            <TextField id="q-company" label="Company (B2B)" value={details.company_name ?? ''} onChange={set('company_name')} />
            <TextField id="q-gstin" label="GSTIN" value={details.gstin ?? ''} onChange={set('gstin')} style={{ textTransform: 'uppercase' }} />
            {isNew && <SelectField id="q-source" label="Source" value={details.source} onChange={set('source')} options={SOURCES} />}
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-semibold">Follow-up</h2>
            {!isNew && <SelectField id="q-status" label="Status" value={details.status} onChange={set('status')} options={STATUSES} />}
            {!isNew && <CheckboxField id="q-contacted" label="Customer contacted" checked={Boolean(details.contacted)} onChange={set('contacted')} />}
            <div className="grid grid-cols-2 gap-3">
              <TextField id="q-follow" label="Follow up on" type="date" value={details.follow_up_on ?? ''} onChange={set('follow_up_on')} />
              <TextField id="q-valid" label="Valid until" type="date" value={details.valid_until ?? ''} onChange={set('valid_until')} hint={isNew ? '15 days if empty' : undefined} />
            </div>
            {!limited && staff.length > 0 && (
              <SelectField
                id="q-assigned"
                label="Salesperson"
                value={details.assigned_to ?? ''}
                onChange={set('assigned_to')}
                options={[{ value: '', label: 'Not assigned' }, ...staff.map((u) => ({ value: u.id, label: `${u.full_name} (${u.role_name})` }))]}
              />
            )}
            <TextAreaField id="q-notes" label="Notes (internal)" value={details.notes ?? ''} onChange={set('notes')} />
            {!isNew && (
              <Button className="w-full" variant="secondary" onClick={saveDetails} disabled={!detailsChanged || saving}>
                {saving === 'details' ? 'Saving…' : 'Save details'}
              </Button>
            )}
          </Card>

          {!isNew && <FollowUps quote={quote} api={api} onLogged={loaded.reload} />}
          {!isNew && quote.audit?.length > 0 && <AuditTrail entries={quote.audit} />}
        </div>
      </div>
    </div>
  );
}

/** Find a product by name, code or dynamic code (AT1002-HET adds it in Hettich) and add it as a line. */
function AddProduct({ onAdd }) {
  const [term, setTerm] = useState('');
  const results = term.trim() ? searchCatalog(PRODUCTS, { search: term }).results.slice(0, 8) : [];
  const byCode = parseCode(term);
  const add = (product) => {
    onAdd(product, product === byCode.product ? byCode.brand : undefined);
    setTerm('');
  };
  return (
    <div className="relative">
      <label className="flex h-10 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-primary">
        <Icon name="search" className="h-4 w-4 shrink-0 text-muted" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && results[0] && (e.preventDefault(), add(results[0]))}
          placeholder="Add product — name, code or AT1002-HET"
          aria-label="Add product"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      {results.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => add(p)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-2">
                <span className="font-mono text-xs font-semibold text-muted">{dynamicCode(p, p === byCode.product ? byCode.brand : null)}</span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="text-xs text-muted">{p.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Follow-up actions: log a call / WhatsApp / visit / email / note with the next follow-up date, and the history. */
function FollowUps({ quote, api, onLogged }) {
  const [kind, setKind] = useState('call');
  const [note, setNote] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.quotes.logActivity(quote.id, { kind, note, next_follow_up_on: next || null });
      setNote('');
      setNext('');
      onLogged();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-3 p-4">
      <h2 className="font-semibold">Follow-up actions</h2>
      <form onSubmit={submit} className="space-y-2">
        <div role="radiogroup" aria-label="What did you do?" className="flex flex-wrap gap-1.5">
          {ACTIONS.map((a) => (
            <button
              key={a.kind}
              type="button"
              role="radio"
              aria-checked={kind === a.kind}
              onClick={() => setKind(a.kind)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ${kind === a.kind ? 'bg-primary text-white ring-primary' : 'ring-line hover:ring-primary'}`}
            >
              <Icon name={a.icon} className="h-3.5 w-3.5" /> {a.label}
            </button>
          ))}
        </div>
        <TextAreaField id="f-note" label="What happened?" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <TextField id="f-next" label="Next follow-up" type="date" value={next} onChange={(e) => setNext(e.target.value)} hint="Leave empty if no further follow-up" />
        <ErrorNote error={error} />
        <Button type="submit" size="sm" className="w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Log follow-up'}
        </Button>
      </form>
      {quote.activities?.length > 0 && (
        <ol className="space-y-2 border-t border-line pt-3">
          {quote.activities.map((a) => (
            <li key={a.id} className="text-xs">
              <p>
                <span className="font-semibold">{KIND_LABEL[a.kind] ?? a.kind}</span>
                <span className="text-muted">
                  {' '}
                  · {new Date(a.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {a.user_name && ` · ${a.user_name}`}
                </span>
              </p>
              {a.note && <p className="text-ink/80">{a.note}</p>}
              {a.next_follow_up_on && <p className="text-primary">Next: {new Date(a.next_follow_up_on).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/** Other brands to offer next to the chosen one on this line (shown to the customer with their prices). */
function Alternatives({ line, product, brands, disabled, onChange }) {
  const ids = line.alternative_brand_ids ?? [];
  const options = brands.filter((b) => b.id !== line.brand_id && !ids.includes(b.id));
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {ids.map((id) => {
        const b = getBrand(id);
        return (
          <span key={id} className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px]">
            Alt: {b?.name ?? id}
            {product && b && ` ${formatCurrency(getUnitPrice(product, b))}`}
            {!disabled && (
              <button type="button" onClick={() => onChange(ids.filter((x) => x !== id))} aria-label={`Remove alternative ${b?.name ?? id}`} className="text-muted hover:text-primary">
                ×
              </button>
            )}
          </span>
        );
      })}
      {!disabled && options.length > 0 && (
        <select
          aria-label={`Add an alternative brand for ${product?.name ?? line.name}`}
          value=""
          onChange={(e) => e.target.value && onChange([...ids, e.target.value])}
          className="rounded-md border border-dashed border-line bg-transparent px-1.5 py-0.5 text-[11px] text-muted outline-none hover:border-primary"
        >
          <option value="">+ alternative</option>
          {options.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {formatCurrency(getUnitPrice(product, b))}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/** Who changed what, when — every field, status and line change on this quotation and its versions. */
function AuditTrail({ entries }) {
  const describe = (changes = {}) => {
    const lines = (changes.lines ?? []).map((c) =>
      c.change === 'added' || c.change === 'removed' ? `${c.product}: ${c.change}${c.to ? ` (${c.to})` : ''}` : `${c.product}: ${c.change} ${show(c.from)} → ${show(c.to)}`,
    );
    const fields = Object.entries(changes)
      .filter(([key]) => key !== 'lines')
      .map(([key, [from, to]]) => `${fieldLabel(key)}: ${show(from)} → ${show(to)}`);
    return [...lines, ...fields];
  };
  return (
    <Card className="space-y-3 p-4">
      <h2 className="font-semibold">Audit trail</h2>
      <ol className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {entries.map((a) => (
          <li key={a.id} className="border-l-2 border-line pl-3 text-xs">
            <p>
              <span className="font-semibold">{AUDIT_ACTION[a.action] ?? a.action}</span>
              <span className="text-muted">
                {' '}
                · {new Date(a.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {a.user_name}
              </span>
            </p>
            {a.note && <p className="text-ink/80">{a.note}</p>}
            {describe(a.changes).map((d) => (
              <p key={d} className="text-muted">
                {d}
              </p>
            ))}
          </li>
        ))}
      </ol>
    </Card>
  );
}
