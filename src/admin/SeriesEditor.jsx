import { useState } from 'react';
import { Button } from '../components/ui';
import { ErrorNote } from './fields';

const input = 'w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary';

/**
 * A brand's series — the "individual" level under class → brand (e.g. Hettich → InnoTech, Sensys).
 * Each change saves straight away; products are put in a series from the product form.
 */
export default function SeriesEditor({ brand, api, onChanged }) {
  const [series, setSeries] = useState(brand.series ?? []);
  const [draft, setDraft] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const add = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    run(async () => {
      const created = await api.series.create({ brand_id: brand.id, name: draft.name.trim(), description: draft.description.trim(), position: series.length });
      setSeries((list) => [...list, created]);
      setDraft({ name: '', description: '' });
    });
  };

  const save = (s, patch) =>
    run(async () => {
      const updated = await api.series.update(s.id, patch);
      setSeries((list) => list.map((x) => (x.id === s.id ? updated : x)));
    });

  const remove = (s) => {
    if (!window.confirm(`Delete the series "${s.name}"? Its products stay in ${brand.name}, just without a series.`)) return;
    run(async () => {
      await api.series.remove(s.id);
      setSeries((list) => list.filter((x) => x.id !== s.id));
    });
  };

  return (
    <section>
      <h3 className="font-semibold">Series</h3>
      <p className="mb-3 text-xs text-muted">
        Class <strong>{brand.tier}</strong> → brand <strong>{brand.name}</strong> → series. Put products in a series from the product form.
      </p>
      {series.length > 0 && (
        <ul className="mb-3 space-y-2">
          {series.map((s) => (
            <SeriesRow key={s.id} series={s} busy={busy} onSave={(patch) => save(s, patch)} onRemove={() => remove(s)} />
          ))}
        </ul>
      )}
      <form onSubmit={add} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
        <input className={input} placeholder="New series name (e.g. InnoTech)" aria-label="New series name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
        <input className={input} placeholder="Short description (optional)" aria-label="New series description" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
        <Button type="submit" size="sm" disabled={busy || !draft.name.trim()}>
          Add series
        </Button>
      </form>
      <div className="mt-2">
        <ErrorNote error={error} />
      </div>
    </section>
  );
}

function SeriesRow({ series, busy, onSave, onRemove }) {
  const [name, setName] = useState(series.name);
  const [description, setDescription] = useState(series.description ?? '');
  const changed = name.trim() !== series.name || description.trim() !== (series.description ?? '');
  return (
    <li className={`grid gap-2 rounded-xl border border-line p-2 sm:grid-cols-[1fr_1.4fr_auto] ${series.active ? '' : 'opacity-60'}`}>
      <input className={input} aria-label="Series name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} aria-label="Series description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex items-center gap-1">
        {changed ? (
          <Button size="sm" disabled={busy || !name.trim()} onClick={() => onSave({ name: name.trim(), description: description.trim() })}>
            Save
          </Button>
        ) : (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onSave({ active: !series.active })}>
            {series.active ? 'Hide' : 'Show'}
          </Button>
        )}
        <Button size="sm" variant="danger" disabled={busy} onClick={onRemove}>
          Delete
        </Button>
      </div>
    </li>
  );
}
