import { useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import { Badge, Button, Card, EmptyState, Icon, Modal, TextField } from '../components/ui';
import { dynamicCode, getBrand, getBrandsForProduct, getProduct, searchCatalog } from '../utils/catalog';
import { CheckboxField, ErrorNote, TextAreaField } from './fields';
import useAsync from './useAsync';

const MANAGERS = [1, 2]; // Admin and Sales manage packages; Limited sales only use them

/** Saved packages / template quotes, e.g. "Modular kitchen hardware set" — added to a quotation in one click. */
export default function PackagesPanel({ api, session }) {
  const canManage = MANAGERS.includes(session.role ?? 1);
  const [editing, setEditing] = useState(null);
  const { result, error, loading, reload } = useAsync(() => api.templates.list(), [api]);
  const packages = result?.data ?? [];

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setEditing({})}>
            + New package
          </Button>
        </div>
      )}
      <ErrorNote error={error} />
      {!loading && !packages.length && !error && <EmptyState title="No packages yet" message="Save a set of products you often quote together — e.g. a modular kitchen hardware set." />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((t) => (
          <Card key={t.id} className={`flex flex-col p-4 ${t.active ? '' : 'opacity-60'}`}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{t.name}</h3>
              <div className="flex gap-1">
                {!t.active && <Badge>Hidden</Badge>}
                {t.public && t.active && <Badge tone="success">On website</Badge>}
              </div>
            </div>
            {t.description && <p className="mt-1 text-sm text-muted">{t.description}</p>}
            <ul className="mt-3 flex-1 space-y-1 text-sm">
              {t.items.map((i) => {
                const product = getProduct(i.product_id);
                return (
                  <li key={i.product_id} className="flex justify-between gap-2">
                    <span className="min-w-0 truncate">{product?.name ?? i.product_id}</span>
                    <span className="shrink-0 text-muted">
                      × {i.quantity}
                      {i.brand_id && ` · ${getBrand(i.brand_id)?.name ?? i.brand_id}`}
                    </span>
                  </li>
                );
              })}
            </ul>
            {canManage && (
              <Button variant="ghost" size="sm" className="mt-3 self-end" onClick={() => setEditing(t)}>
                Edit
              </Button>
            )}
          </Card>
        ))}
      </div>
      {editing && (
        <PackageForm
          pkg={editing}
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

function PackageForm({ pkg, api, onClose, onSaved }) {
  const isNew = !pkg.id;
  const [form, setForm] = useState({ name: pkg.name ?? '', description: pkg.description ?? '', public: pkg.public ?? true, active: pkg.active ?? true });
  const [items, setItems] = useState(pkg.items ?? []);
  const [term, setTerm] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const results = term.trim() ? searchCatalog(PRODUCTS, { search: term }).results.slice(0, 6) : [];
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setItem = (id, patch) => setItems((list) => list.map((i) => (i.product_id === id ? { ...i, ...patch } : i)));
  const add = (product) => {
    setItems((list) => (list.some((i) => i.product_id === product.id) ? list : [...list, { product_id: product.id, quantity: 1 }]));
    setTerm('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = { ...form, items: items.map((i) => ({ product_id: i.product_id, quantity: Number(i.quantity) || 1, ...(i.brand_id && { brand_id: i.brand_id }) })) };
    try {
      await (isNew ? api.templates.create(data) : api.templates.update(pkg.id, data));
      onSaved();
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete the package "${pkg.name}"?`)) return;
    try {
      await api.templates.remove(pkg.id);
      onSaved();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New package' : `Edit ${pkg.name}`}
      footer={
        <div className="flex justify-between gap-2">
          {!isNew ? (
            <Button variant="danger" onClick={remove}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="package-form" disabled={saving || !items.length}>
              {saving ? 'Saving…' : 'Save package'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="package-form" onSubmit={submit} className="space-y-4">
        <TextField id="t-name" label="Name" placeholder="e.g. Modular kitchen hardware set" required value={form.name} onChange={set('name')} />
        <TextAreaField id="t-desc" label="Description" rows={2} value={form.description} onChange={set('description')} />
        <div className="relative">
          <label className="flex h-10 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-primary">
            <Icon name="search" className="h-4 w-4 text-muted" />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Add product — name or code" aria-label="Add product to package" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          {results.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-line bg-surface shadow-lg">
              {results.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => add(p)} className="flex w-full gap-3 px-3 py-2 text-left text-sm hover:bg-surface-2">
                    <span className="font-mono text-xs font-semibold text-muted">{p.code}</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {items.map((i) => {
              const product = getProduct(i.product_id);
              return (
                <li key={i.product_id} className="flex flex-wrap items-center gap-2 p-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{product?.name ?? i.product_id}</span>
                    <span className="font-mono text-[11px] text-muted">{product ? dynamicCode(product, getBrand(i.brand_id)) : ''}</span>
                  </span>
                  <select
                    aria-label={`Brand for ${product?.name}`}
                    value={i.brand_id ?? ''}
                    onChange={(e) => setItem(i.product_id, { brand_id: e.target.value || undefined })}
                    className="w-36 rounded-lg border border-line px-2 py-1 text-xs"
                  >
                    <option value="">Any brand</option>
                    {(product ? getBrandsForProduct(product) : []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    aria-label={`Quantity of ${product?.name}`}
                    value={i.quantity}
                    onChange={(e) => setItem(i.product_id, { quantity: e.target.value })}
                    className="w-16 rounded-lg border border-line px-2 py-1"
                  />
                  <button type="button" onClick={() => setItems((list) => list.filter((x) => x.product_id !== i.product_id))} aria-label={`Remove ${product?.name}`} className="rounded p-1 text-muted hover:text-primary">
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <CheckboxField id="t-public" label="Show on the website" checked={form.public} onChange={set('public')} />
          <CheckboxField id="t-active" label="Active" checked={form.active} onChange={set('active')} />
        </div>
        <ErrorNote error={error} />
      </form>
    </Modal>
  );
}
