import { useState } from 'react';
import { Button, Modal, TextField } from '../components/ui';
import { CheckboxField, ErrorNote, SelectField, TextAreaField } from './fields';

const UNITS = ['piece', 'pair', 'set', 'sheet', 'box', 'roll', 'kg', 'litre', 'metre', 'sq ft'];

const toForm = (p, categories) => ({
  name: p.name ?? '',
  category: p.category ?? categories[0]?.name ?? '',
  unit: p.unit ?? 'piece',
  base_price: p.base_price ?? '',
  description: p.description ?? '',
  image: p.image ?? '',
  brand_ids: p.brand_ids ?? [],
  position: p.position ?? 0,
  active: p.active ?? true,
});

/** Add or edit one product. Prices are the base rate; each brand's price factor is applied on the site. */
export default function ProductForm({ product, categories, brands, api, onClose, onSaved }) {
  const isNew = !product.id;
  const [form, setForm] = useState(() => toForm(product, categories));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggleBrand = (id) =>
    setForm((f) => ({ ...f, brand_ids: f.brand_ids.includes(id) ? f.brand_ids.filter((b) => b !== id) : [...f.brand_ids, id] }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = { ...form, base_price: Number(form.base_price), position: Number(form.position) || 0, image: form.image.trim() || null };
    try {
      await (isNew ? api.products.create(data) : api.products.update(product.id, data));
      onSaved();
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  const unitOptions = UNITS.includes(form.unit) ? UNITS : [form.unit, ...UNITS];

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'Add product' : `Edit ${product.name}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save product'}
          </Button>
        </div>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4">
        <TextField id="p-name" label="Name" required value={form.name} onChange={set('name')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField id="p-category" label="Category" value={form.category} onChange={set('category')} options={categories.map((c) => ({ value: c.name, label: c.name }))} />
          <SelectField id="p-unit" label="Sold per" value={form.unit} onChange={set('unit')} options={unitOptions.map((u) => ({ value: u, label: u }))} />
          <TextField id="p-price" label="Base price (₹, before brand factor)" type="number" min="1" step="1" required value={form.base_price} onChange={set('base_price')} />
          <TextField id="p-position" label="Sort order (lower shows first)" type="number" step="1" value={form.position} onChange={set('position')} />
        </div>
        <TextAreaField id="p-description" label="Description" value={form.description} onChange={set('description')} />
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <TextField id="p-image" label="Image URL" type="url" placeholder="https://…" value={form.image} onChange={set('image')} />
          </div>
          {form.image && <img src={form.image} alt="" className="h-16 w-16 rounded-lg border border-line object-cover" />}
        </div>
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-muted">Available in brands</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {brands.map((b) => (
              <CheckboxField key={b.id} id={`p-brand-${b.id}`} label={b.name} checked={form.brand_ids.includes(b.id)} onChange={() => toggleBrand(b.id)} />
            ))}
          </div>
        </fieldset>
        <CheckboxField id="p-active" label="Show on website" checked={form.active} onChange={set('active')} />
        <ErrorNote error={error} />
      </form>
    </Modal>
  );
}
