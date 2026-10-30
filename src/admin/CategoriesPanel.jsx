import { useState } from 'react';
import { Badge, Button, Card, Icon, IconTile, Modal, TextField } from '../components/ui';
import { CheckboxField, ErrorNote, SelectField } from './fields';
import useAsync from './useAsync';

// icons that suit a product category (from components/ui/Icon)
const ICONS = ['box', 'layers', 'grid', 'door', 'shield', 'monitor', 'diamond', 'tag', 'bulb', 'award', 'home'];

/** Categories: name, icon and the order they appear in on the website. */
export default function CategoriesPanel({ api }) {
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState(null);
  const { result, error, loading, reload } = useAsync(() => api.categories.list(), [api]);
  const categories = result?.data ?? [];

  const remove = async (category) => {
    if (!window.confirm(`Delete the category "${category.name}"?`)) return;
    setActionError(null);
    try {
      await api.categories.remove(category.id);
      reload();
    } catch (err) {
      setActionError(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({})}>
          Add category
        </Button>
      </div>
      <ErrorNote error={error ?? actionError} />
      <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 text-right font-medium">Products</th>
              <th className="px-4 py-2 text-right font-medium">Order</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((c) => (
              <tr key={c.id} className={c.active ? '' : 'text-muted'}>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-3 font-medium">
                    <IconTile name={c.icon} className="h-8 w-8" />
                    {c.name}
                    {!c.active && <Badge>Hidden</Badge>}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">{c.product_count}</td>
                <td className="px-4 py-2.5 text-right">{c.position}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(c)} disabled={c.product_count > 0} title={c.product_count > 0 ? 'Move its products to another category first' : undefined}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editing && (
        <CategoryForm
          category={editing}
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

function CategoryForm({ category, api, onClose, onSaved }) {
  const isNew = !category.id;
  const [form, setForm] = useState({ name: category.name ?? '', icon: category.icon ?? 'box', position: category.position ?? 0, active: category.active ?? true });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = { ...form, position: Number(form.position) || 0 };
    try {
      await (isNew ? api.categories.create(data) : api.categories.update(category.id, data));
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
      title={isNew ? 'Add category' : `Edit ${category.name}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save category'}
          </Button>
        </div>
      }
    >
      <form id="category-form" onSubmit={submit} className="space-y-4">
        <TextField
          id="c-name"
          label="Name"
          hint={isNew ? undefined : 'Renaming also updates every product in this category.'}
          required
          value={form.name}
          onChange={set('name')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <SelectField id="c-icon" label="Icon" value={form.icon} onChange={set('icon')} options={ICONS.map((i) => ({ value: i, label: i }))} />
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon name={form.icon} />
            </span>
          </div>
          <TextField id="c-position" label="Order on the website" type="number" step="1" value={form.position} onChange={set('position')} />
        </div>
        <CheckboxField id="c-active" label="Show on website" checked={form.active} onChange={set('active')} />
        <ErrorNote error={error} />
      </form>
    </Modal>
  );
}
