import { useState } from 'react';
import { BRAND_SPEC_FIELDS } from '../data/catalog';
import { Badge, Button, Card, Modal, TextField } from '../components/ui';
import { CheckboxField, ErrorNote, SelectField } from './fields';
import useAsync from './useAsync';

const TIERS = ['Premium', 'Standard', 'Economy'];

/** Brands, their price factor (multiplies a product's base price) and the specs shown on the compare page. */
export default function BrandsPanel({ api }) {
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState(null);
  const { result, error, loading, reload } = useAsync(() => api.brands.list(), [api]);
  const brands = result?.data ?? [];

  const toggleActive = async (brand) => {
    setActionError(null);
    try {
      await (brand.active ? api.brands.remove(brand.id) : api.brands.update(brand.id, { active: true }));
      reload();
    } catch (err) {
      setActionError(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({})}>
          Add brand
        </Button>
      </div>
      <ErrorNote error={error ?? actionError} />
      <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Brand</th>
              <th className="px-4 py-2 font-medium">Tier</th>
              <th className="px-4 py-2 text-right font-medium">Price factor</th>
              <th className="px-4 py-2 font-medium">Warranty</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {brands.map((b) => (
              <tr key={b.id} className={b.active ? '' : 'text-muted'}>
                <td className="px-4 py-2.5 font-medium">
                  {b.name}
                  {!b.active && <Badge className="ml-2">Hidden</Badge>}
                </td>
                <td className="px-4 py-2.5">{b.tier && <Badge tone={b.tier}>{b.tier}</Badge>}</td>
                <td className="px-4 py-2.5 text-right">× {Number(b.price_factor).toFixed(2)}</td>
                <td className="px-4 py-2.5">{b.specs?.warranty}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(b)}>
                    Edit
                  </Button>
                  <Button variant={b.active ? 'danger' : 'ghost'} size="sm" onClick={() => toggleActive(b)}>
                    {b.active ? 'Hide' : 'Show'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editing && (
        <BrandForm
          brand={editing}
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

function BrandForm({ brand, api, onClose, onSaved }) {
  const isNew = !brand.id;
  const [form, setForm] = useState({
    name: brand.name ?? '',
    tier: brand.tier ?? 'Standard',
    price_factor: brand.price_factor ?? 1,
    specs: Object.fromEntries(BRAND_SPEC_FIELDS.map((f) => [f.key, brand.specs?.[f.key] ?? ''])),
    position: brand.position ?? 0,
    active: brand.active ?? true,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setSpec = (key) => (e) => setForm((f) => ({ ...f, specs: { ...f.specs, [key]: e.target.value } }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = { ...form, price_factor: Number(form.price_factor), position: Number(form.position) || 0 };
    try {
      await (isNew ? api.brands.create(data) : api.brands.update(brand.id, data));
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
      title={isNew ? 'Add brand' : `Edit ${brand.name}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="brand-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save brand'}
          </Button>
        </div>
      }
    >
      <form id="brand-form" onSubmit={submit} className="space-y-4">
        <TextField id="b-name" label="Name" required value={form.name} onChange={set('name')} />
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField id="b-tier" label="Tier" value={form.tier} onChange={set('tier')} options={TIERS.map((t) => ({ value: t, label: t }))} />
          <TextField
            id="b-factor"
            label="Price factor"
            hint="1.35 = 35% above base price"
            type="number"
            min="0.1"
            max="20"
            step="0.01"
            required
            value={form.price_factor}
            onChange={set('price_factor')}
          />
          <TextField id="b-position" label="Sort order" type="number" step="1" value={form.position} onChange={set('position')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {BRAND_SPEC_FIELDS.map((f) => (
            <TextField key={f.key} id={`b-spec-${f.key}`} label={f.label} value={form.specs[f.key]} onChange={setSpec(f.key)} />
          ))}
        </div>
        <CheckboxField id="b-active" label="Show on website" checked={form.active} onChange={set('active')} />
        <ErrorNote error={error} />
      </form>
    </Modal>
  );
}
