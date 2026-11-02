import { useState } from 'react';
import { Badge, Button, Card, Modal, TextField } from '../components/ui';
import { CheckboxField, ErrorNote, SelectField } from './fields';
import useAsync from './useAsync';

const ROLES = [
  { value: 1, label: 'Admin', note: 'Everything — staff accounts, catalog, all quotations, prices.' },
  { value: 2, label: 'Sales', note: 'All quotations: create, edit, override prices, follow up.' },
  { value: 3, label: 'Limited sales', note: 'Only quotations assigned to or created by them; list prices only.' },
];
const ROLE_TONE = { 1: 'primary', 2: 'success', 3: 'neutral' };

/** Admin only: sales team accounts and their roles. */
export default function StaffPanel({ api, session }) {
  const [editing, setEditing] = useState(null);
  const { result, error, loading, reload } = useAsync(() => api.users.list(), [api]);
  const users = result?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <ul className="space-y-1 text-xs text-muted">
          {ROLES.map((r) => (
            <li key={r.value}>
              <strong className="text-ink">{r.label}:</strong> {r.note}
            </li>
          ))}
        </ul>
        <Button size="sm" onClick={() => setEditing({})}>
          + Add staff
        </Button>
      </div>
      <ErrorNote error={error} />
      <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Last sign-in</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className={u.active ? '' : 'text-muted'}>
                <td className="px-4 py-2.5 font-medium">
                  {u.full_name}
                  {u.id === session.id && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                  {!u.active && <Badge className="ml-1.5">Inactive</Badge>}
                </td>
                <td className="px-4 py-2.5">{u.email}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={ROLE_TONE[u.role]}>{u.role_name}</Badge>
                </td>
                <td className="px-4 py-2.5 text-muted">{u.last_logged_in_at ? new Date(u.last_logged_in_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(u)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {editing && (
        <StaffForm
          user={editing}
          self={editing.id === session.id}
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

function StaffForm({ user, self, api, onClose, onSaved }) {
  const isNew = !user.id;
  const [form, setForm] = useState({ full_name: user.full_name ?? '', email: user.email ?? '', phone_number: user.phone_number ?? '', role: user.role ?? 2, active: user.active ?? true, password: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = { ...form, role: Number(form.role) };
    if (!data.password) delete data.password;
    try {
      await (isNew ? api.users.create(data) : api.users.update(user.id, data));
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
      title={isNew ? 'Add staff' : `Edit ${user.full_name}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="staff-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      }
    >
      <form id="staff-form" onSubmit={submit} className="space-y-4">
        <TextField id="s-name" label="Full name" required value={form.full_name} onChange={set('full_name')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="s-email" label="Email (used to sign in)" type="email" required value={form.email} onChange={set('email')} />
          <TextField id="s-phone" label="Mobile" type="tel" value={form.phone_number} onChange={set('phone_number')} />
        </div>
        <SelectField id="s-role" label="Role" value={form.role} onChange={set('role')} disabled={self} options={ROLES.map((r) => ({ value: r.value, label: `${r.label} — ${r.note}` }))} />
        <TextField
          id="s-password"
          label={isNew ? 'Password' : 'New password'}
          type="password"
          autoComplete="new-password"
          required={isNew}
          hint={isNew ? 'At least 8 characters — share it with them privately' : 'Leave empty to keep the current password'}
          value={form.password}
          onChange={set('password')}
        />
        {!isNew && !self && <CheckboxField id="s-active" label="Active (can sign in)" checked={form.active} onChange={set('active')} />}
        <ErrorNote error={error} />
      </form>
    </Modal>
  );
}
