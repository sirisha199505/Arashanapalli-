import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, EmptyState } from '../components/ui';
import { STOCK } from '../utils/catalog';
import { formatCurrency } from '../utils/format';
import { ErrorNote, Pager } from './fields';
import useAsync, { useDebounced } from './useAsync';

const PAGE_SIZES = [25, 50, 100];
const STOCK_OPTIONS = [{ value: '', label: 'Not tracked' }, ...Object.entries(STOCK).map(([value, s]) => ({ value, label: s.label }))];

// what "Apply" can do to the ticked rows (or the whole page). It only fills in the cells — nothing is saved until "Save changes".
const BRAND_ACTIONS = [
  { value: 'price_pct', label: 'Change price by %', input: 'number', placeholder: 'e.g. 5 or -10' },
  { value: 'price', label: 'Set price (₹)', input: 'number' },
  { value: 'price_reset', label: 'Back to standard price' },
  { value: 'stock_status', label: 'Set stock', input: 'stock' },
  { value: 'stock_qty', label: 'Set stock qty', input: 'number' },
  { value: 'image', label: 'Set photo URL', input: 'text' },
  { value: 'description', label: 'Set description', input: 'text' },
];
const PRODUCT_ACTIONS = [
  { value: 'base_pct', label: 'Change base price by %', input: 'number', placeholder: 'e.g. 5 or -10' },
  { value: 'base_price', label: 'Set base price (₹)', input: 'number' },
  { value: 'unit', label: 'Set unit', input: 'text' },
  { value: 'description', label: 'Set description', input: 'text' },
  { value: 'new_on', label: 'Mark as new arrival' },
  { value: 'new_off', label: 'Remove new arrival' },
  { value: 'show', label: 'Show on website' },
  { value: 'hide', label: 'Hide from website' },
];

const blank = (v) => (v === null || v === undefined ? '' : v);
const control = 'w-full rounded-md border px-2 py-1 text-xs outline-none focus:border-primary';
const filterInput = 'rounded-lg border border-line bg-surface px-2.5 py-2 text-sm outline-none focus:border-primary';

/**
 * Admin: update many products at once, a page at a time — e.g. all of Godrej's products: price, stock, photo,
 * description; or (no brand chosen) the products' own details. Edit cells or apply a change to ticked rows, check the
 * highlighted cells, then save the page. Every saved change goes into the audit log, one batch per save.
 */
export default function BulkUpdatePanel({ api, onNavigate }) {
  const [filters, setFilters] = useState({ brand_id: '', category: '', search: '', status: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [edits, setEdits] = useState({}); // { productId: { field: value } } — not saved yet
  const [selected, setSelected] = useState(() => new Set());
  const [rowErrors, setRowErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(null); // the last save's { updated, unchanged, batch_id }
  const search = useDebounced(filters.search);

  const lists = useAsync(() => Promise.all([api.brands.list({ page_size: 300 }), api.categories.list()]), [api]);
  const [brands, categories] = lists.result?.map((r) => r.data) ?? [[], []];
  const { result, error, loading, reload } = useAsync(
    () =>
      api.products
        .bulk({ brand_id: filters.brand_id, category: filters.category, search, status: filters.status, page, page_size: pageSize })
        .then((res) => ({ ...res, brand_id: filters.brand_id })),
    [api, filters.brand_id, filters.category, search, filters.status, page, pageSize],
  );
  const rows = result?.data ?? [];
  // the brand the rows on screen were loaded for (not the one just picked, whose rows are still loading)
  const brand = brands.find((b) => b.id === result?.brand_id);
  const actions = brand ? BRAND_ACTIONS : PRODUCT_ACTIONS;

  const original = (row, field) => blank(brand ? row.brand?.[field] : row[field]);
  const valueOf = (row, field) => (edits[row.id] && field in edits[row.id] ? edits[row.id][field] : original(row, field));
  const isChanged = (row, field) => edits[row.id] && field in edits[row.id] && String(edits[row.id][field]) !== String(original(row, field));
  const changedFields = (row) => Object.keys(edits[row.id] ?? {}).filter((f) => isChanged(row, f));
  const changedRows = rows.filter((r) => changedFields(r).length);

  const setCell = (id, field, value) => setEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));
  const reset = () => (setEdits({}), setRowErrors({}), setSelected(new Set()), setSaveError(null));
  // after a save the edits stay on screen until the saved rows have been loaded again — no flash of the old values
  const [refreshing, setRefreshing] = useState(false);
  const savedFrom = useRef(null); // the rows the save was made on
  useEffect(() => {
    if (refreshing && (result !== savedFrom.current || error)) {
      reset();
      setRefreshing(false);
    }
  }, [refreshing, result, error]); // eslint-disable-line react-hooks/exhaustive-deps
  // leaving the page (filters, paging) drops unsaved changes — ask first
  const guard = (change) => {
    if (changedRows.length && !window.confirm(`${changedRows.length} product${changedRows.length === 1 ? ' has' : 's have'} unsaved changes on this page. Discard them?`)) return;
    reset();
    change();
  };
  const setFilter = (key) => (e) => {
    const value = e.target.value;
    guard(() => (setFilters((f) => ({ ...f, [key]: value })), setPage(1), setSaved(null)));
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = changedRows.map((r) => ({ id: r.id, [brand ? 'brand' : 'product']: Object.fromEntries(changedFields(r).map((f) => [f, edits[r.id][f]])) }));
      setSaved(await api.products.saveBulk({ brand_id: brand?.id, rows: payload }));
      savedFrom.current = result;
      setRefreshing(true);
      reload();
    } catch (err) {
      setRowErrors(err.data?.rows ?? {});
      setSaveError(err.data?.rows ? new Error(`${Object.keys(err.data.rows).length} product(s) need fixing — see the rows marked in red. Nothing was saved.`) : err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <Card className="flex flex-wrap items-end gap-2 p-3">
        <label>
          <span className="mb-1 block text-[11px] font-medium text-muted">Brand</span>
          <select aria-label="Brand" value={filters.brand_id} onChange={setFilter('brand_id')} className={`${filterInput} w-56`}>
            <option value="">All brands — product details</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-muted">Category</span>
          <select aria-label="Category" value={filters.category} onChange={setFilter('category')} className={filterInput}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-48 flex-1">
          <span className="mb-1 block text-[11px] font-medium text-muted">Search</span>
          <input type="search" aria-label="Search products" placeholder="Name or code" value={filters.search} onChange={setFilter('search')} className={`${filterInput} w-full`} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-muted">On website</span>
          <select aria-label="On website" value={filters.status} onChange={setFilter('status')} className={filterInput}>
            <option value="">Shown and hidden</option>
            <option value="shown">Shown</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-muted">Per page</span>
          <select aria-label="Products per page" value={pageSize} onChange={(e) => guard(() => (setPageSize(Number(e.target.value)), setPage(1)))} className={filterInput}>
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {result ? (
            <>
              <span className="font-semibold text-ink">{result.total}</span> product{result.total === 1 ? '' : 's'}
              {brand ? ` in ${brand.name}` : ''} · page {page} of {Math.max(result.total_pages, 1)}
              {brand ? ' · blank price = standard (base price × brand factor)' : ''}
            </>
          ) : (
            'Loading…'
          )}
        </p>
        <ApplyBar key={brand?.id ?? 'products'} actions={actions} count={selected.size || rows.length} scope={selected.size ? 'ticked' : 'on this page'} onApply={apply} />
      </div>

      {saved && (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-800">
          {saved.updated ? `Saved ${saved.updated} product${saved.updated === 1 ? '' : 's'}.` : 'Nothing had changed.'}
          {saved.batch_id && (
            <button className="font-semibold underline" onClick={() => onNavigate('/admin/audit', { batch_id: saved.batch_id })}>
              See it in the audit log
            </button>
          )}
        </p>
      )}
      <ErrorNote error={error ?? lists.error} />
      {!loading && !rows.length && !error && <EmptyState title="No products found" message="Try another brand, category or search." />}

      {rows.length > 0 && (
        <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[68rem] text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="w-8 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label="Tick every product on this page"
                    className="h-4 w-4 accent-primary"
                    checked={selected.size === rows.length}
                    onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                  />
                </th>
                <th className="px-2 py-2 font-medium">{brand ? 'Item code' : 'Code'}</th>
                <th className="px-2 py-2 font-medium">Product</th>
                {brand ? (
                  <>
                    <th className="w-32 px-2 py-2 font-medium">{brand.name} price (₹)</th>
                    <th className="w-32 px-2 py-2 font-medium">Stock</th>
                    <th className="w-20 px-2 py-2 font-medium">Qty</th>
                  </>
                ) : (
                  <>
                    <th className="w-28 px-2 py-2 font-medium">Base price (₹)</th>
                    <th className="w-24 px-2 py-2 font-medium">Unit</th>
                  </>
                )}
                <th className="w-52 px-2 py-2 font-medium">Photo URL</th>
                <th className="px-2 py-2 font-medium">Description</th>
                {!brand && (
                  <>
                    <th className="px-2 py-2 text-center font-medium">New</th>
                    <th className="px-2 py-2 text-center font-medium">Shown</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {rows.map((row) => {
                const cell = (field) => `${control} ${isChanged(row, field) ? 'border-primary/60 bg-primary/5' : 'border-line bg-surface'}`;
                const input = (field, { label, ...props }) => (
                  <input aria-label={`${label} for ${row.name}`} value={valueOf(row, field)} onChange={(e) => setCell(row.id, field, e.target.value)} className={cell(field)} {...props} />
                );
                const check = (field, label) => (
                  <input
                    type="checkbox"
                    aria-label={`${label} — ${row.name}`}
                    className={`h-4 w-4 accent-primary ${isChanged(row, field) ? 'ring-2 ring-primary/40' : ''}`}
                    checked={Boolean(valueOf(row, field))}
                    onChange={(e) => setCell(row.id, field, e.target.checked)}
                  />
                );
                const image = valueOf(row, 'image') || (brand ? row.image : '');
                return (
                  <tr key={row.id} className={rowErrors[row.id] ? 'bg-primary/5' : changedFields(row).length ? 'bg-surface-2/50' : ''}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`Tick ${row.name}`}
                        className="h-4 w-4 accent-primary"
                        checked={selected.has(row.id)}
                        onChange={() => setSelected((s) => (s.has(row.id) ? new Set([...s].filter((id) => id !== row.id)) : new Set([...s, row.id])))}
                      />
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-xs font-semibold">{brand ? row.brand.dynamic_code : row.code}</td>
                    <td className="min-w-48 px-2 py-2">
                      {brand ? <span className="font-medium">{row.name}</span> : input('name', { label: 'Name' })}
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {row.category}
                        {!row.active && <Badge className="ml-1.5">Hidden</Badge>}
                      </span>
                      {rowErrors[row.id] && (
                        <span role="alert" className="mt-1 block text-xs font-semibold text-primary">
                          {rowErrors[row.id].join(' · ')}
                        </span>
                      )}
                    </td>
                    {brand ? (
                      <>
                        <td className="px-2 py-2">
                          {input('price', { label: 'Price', type: 'number', min: 1, placeholder: String(row.brand.standard_price) })}
                          <span className="mt-0.5 block text-[11px] text-muted">Standard {formatCurrency(row.brand.standard_price)}</span>
                        </td>
                        <td className="px-2 py-2">
                          <select aria-label={`Stock for ${row.name}`} value={valueOf(row, 'stock_status')} onChange={(e) => setCell(row.id, 'stock_status', e.target.value)} className={cell('stock_status')}>
                            {STOCK_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">{input('stock_qty', { label: 'Stock qty', type: 'number', min: 0 })}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-2">{input('base_price', { label: 'Base price', type: 'number', min: 1 })}</td>
                        <td className="px-2 py-2">{input('unit', { label: 'Unit' })}</td>
                      </>
                    )}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        {image ? <img src={image} alt="" className="h-8 w-8 shrink-0 rounded border border-line bg-white object-contain" /> : <span className="h-8 w-8 shrink-0 rounded border border-dashed border-line" />}
                        {input('image', { label: 'Photo URL', placeholder: brand ? 'Product photo' : 'https://…' })}
                      </div>
                    </td>
                    <td className="min-w-56 px-2 py-2">{input('description', { label: 'Description', placeholder: brand ? 'Product description' : '', title: valueOf(row, 'description') })}</td>
                    {!brand && (
                      <>
                        <td className="px-2 py-2 text-center">{check('new_arrival', 'New arrival')}</td>
                        <td className="px-2 py-2 text-center">{check('active', 'Shown on website')}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      <Pager page={page} totalPages={result?.total_pages ?? 1} onChange={(p) => guard(() => (setPage(p), setSaved(null)))} />

      {/* the changes on this page, waiting to be saved */}
      {(changedRows.length > 0 || saveError) && !refreshing && (
        <div className="sticky bottom-3 z-10">
          <Card className="flex flex-wrap items-center gap-3 p-3 shadow-lg">
            <p className="text-sm">
              <span className="font-semibold">{changedRows.length}</span> product{changedRows.length === 1 ? '' : 's'} changed on this page
              <span className="text-muted"> · highlighted cells</span>
            </p>
            <div className="min-w-0 flex-1">
              <ErrorNote error={saveError} />
            </div>
            <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
              Discard
            </Button>
            <Button size="sm" onClick={save} disabled={saving || !changedRows.length}>
              {saving ? 'Saving…' : `Save ${changedRows.length} change${changedRows.length === 1 ? '' : 's'}`}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );

  // fills in the cells of the ticked rows (or every row on the page); returns an error message, if any
  function apply(action, value) {
    const targets = selected.size ? rows.filter((r) => selected.has(r.id)) : rows;
    const number = Number(value);
    if (['price_pct', 'base_pct', 'price', 'base_price', 'stock_qty'].includes(action) && (value === '' || !Number.isFinite(number))) return 'Enter a number';
    if (['price', 'base_price'].includes(action) && !(Number.isInteger(number) && number > 0)) return 'Enter a whole number of 1 or more';
    if (action === 'stock_qty' && !(Number.isInteger(number) && number >= 0)) return 'Enter a whole number of 0 or more';
    const pct = (base) => String(Math.max(1, Math.round(base * (1 + number / 100))));
    const change = {
      price_pct: (r) => ['price', pct(Number(valueOf(r, 'price')) || r.brand.standard_price)],
      price: () => ['price', String(number)],
      price_reset: () => ['price', ''],
      stock_status: () => ['stock_status', value],
      stock_qty: () => ['stock_qty', String(number)],
      image: () => ['image', value.trim()],
      description: () => ['description', value.trim()],
      base_pct: (r) => ['base_price', pct(Number(valueOf(r, 'base_price')))],
      base_price: () => ['base_price', String(number)],
      unit: () => ['unit', value.trim()],
      new_on: () => ['new_arrival', true],
      new_off: () => ['new_arrival', false],
      show: () => ['active', true],
      hide: () => ['active', false],
    }[action];
    setEdits((e) => {
      const next = { ...e };
      targets.forEach((r) => {
        const [field, v] = change(r);
        next[r.id] = { ...next[r.id], [field]: v };
      });
      return next;
    });
    return null;
  }
}

/** "With 12 ticked products: [Change price by %] [5] Apply" — fills the cells, the admin checks them and saves. */
function ApplyBar({ actions, count, scope, onApply }) {
  const [action, setAction] = useState(actions[0].value);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState(null);
  const current = actions.find((a) => a.value === action) ?? actions[0];

  const apply = () => {
    const problem = onApply(current.value, value);
    setMessage(problem ?? `Filled in for ${count} product${count === 1 ? '' : 's'} — check the highlighted cells, then save.`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">
        With {count} {scope}:
      </span>
      <select aria-label="Change to apply" value={action} onChange={(e) => (setAction(e.target.value), setValue(actions.find((a) => a.value === e.target.value)?.input === 'stock' ? 'in_stock' : ''), setMessage(null))} className={filterInput}>
        {actions.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>
      {current.input === 'stock' && (
        <select aria-label="Stock to set" value={value} onChange={(e) => setValue(e.target.value)} className={filterInput}>
          {STOCK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
      {(current.input === 'number' || current.input === 'text') && (
        <input
          aria-label="Value to apply"
          type={current.input}
          placeholder={current.placeholder ?? ''}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${filterInput} ${current.input === 'number' ? 'w-28' : 'w-56'}`}
        />
      )}
      <Button size="sm" variant="secondary" onClick={apply} disabled={!count}>
        Apply
      </Button>
      {message && (
        <span role="status" className="basis-full text-right text-xs text-muted">
          {message}
        </span>
      )}
    </div>
  );
}
