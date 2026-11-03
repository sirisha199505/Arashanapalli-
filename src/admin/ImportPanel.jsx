import { useState } from 'react';
import { Button, Card, Icon } from '../components/ui';
import { CheckboxField, ErrorNote } from './fields';

const MAX_MB = 5;
const TEMPLATE = '/templates/Product_Details_Template.xlsx';

const readAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * Admin: load the client's filled-in product Excel. "Check file" shows what would be added and changed, and every
 * problem by sheet and row — nothing is saved. "Import" then saves it all at once (all or nothing), with every change
 * in the audit log as one batch.
 */
export default function ImportPanel({ api, onNavigate }) {
  const [file, setFile] = useState(null);
  const [hideMissing, setHideMissing] = useState(false);
  const [busy, setBusy] = useState(null); // 'check' | 'import'
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [done, setDone] = useState(null); // { summary, batch_id }

  const payload = async () => ({ file: await readAsBase64(file), hide_missing: hideMissing });
  const run = async (kind, work) => {
    setBusy(kind);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  const choose = (e) => {
    const picked = e.target.files?.[0] ?? null;
    setPreview(null);
    setDone(null);
    setError(picked && picked.size > MAX_MB * 1024 * 1024 ? new Error(`The file is too big (${MAX_MB} MB at most)`) : null);
    setFile(picked && picked.size <= MAX_MB * 1024 * 1024 ? picked : null);
  };

  const check = () => run('check', async () => setPreview(await api.products.checkImport(await payload())));

  const importNow = () => {
    const s = preview.summary;
    const lines = [
      `${plural(s.products_new, 'new product')}, ${plural(s.products_updated, 'product')} updated`,
      `${plural(s.brand_prices, 'brand price')}`,
      s.products_hidden ? `${plural(s.products_hidden, 'product')} HIDDEN from the website` : null,
    ].filter(Boolean);
    if (!window.confirm(`Import this file?\n\n${lines.join('\n')}\n\nEverything is saved at once and recorded in the audit log.`)) return;
    run('import', async () => {
      setDone(await api.products.runImport(await payload()));
      setPreview(null);
    });
  };

  return (
    <div className="max-w-5xl space-y-4">
      <Card className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="font-semibold">1. The template</h2>
          <p className="mt-1 text-sm text-muted">
            Send this Excel to the client: Products, Brand prices &amp; stock, and Brands. Their filled-in file comes back here.
          </p>
        </div>
        <Button as="a" href={TEMPLATE} download variant="secondary">
          <Icon name="file" className="h-4 w-4" /> Download template
        </Button>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-semibold">2. Check the filled-in file</h2>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Excel file (.xlsx, up to {MAX_MB} MB)</span>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            aria-label="Excel file to import"
            onChange={choose}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/15"
          />
        </label>
        <div>
          <CheckboxField
            id="hide-missing"
            label="Hide website products that are not in this file"
            checked={hideMissing}
            onChange={(e) => (setHideMissing(e.target.checked), setPreview(null))}
          />
          <p className="ml-6 mt-1 text-xs text-muted">
            Use this when the file is the client's complete product list — e.g. to replace the sample products. Hidden products stay on old quotations and can be shown
            again.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={check} disabled={!file || busy}>
            {busy === 'check' ? 'Checking…' : 'Check file'}
          </Button>
          <span className="text-xs text-muted">Checking saves nothing — it shows what the import would do.</span>
        </div>
        <ErrorNote error={error} />
      </Card>

      {done && (
        <Card role="status" className="space-y-2 border-emerald-600/30 bg-emerald-600/5 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-emerald-800">
            <Icon name="checkCircle" className="h-5 w-5" /> Imported
          </h2>
          <p className="text-sm">
            {plural(done.summary.products_new, 'new product')} · {plural(done.summary.products_updated, 'product')} updated · {plural(done.summary.brand_prices, 'brand price')}
            {done.summary.products_hidden ? ` · ${plural(done.summary.products_hidden, 'product')} hidden` : ''}
          </p>
          <button className="text-sm font-semibold text-primary hover:underline" onClick={() => onNavigate('/admin/audit', { batch_id: done.batch_id })}>
            See every change in the audit log →
          </button>
        </Card>
      )}

      {preview && <Preview preview={preview} busy={busy} onImport={importNow} />}
    </div>
  );
}

function Preview({ preview, busy, onImport }) {
  const { summary: s, samples, errors, warnings } = preview;
  const tiles = [
    ['New products', s.products_new],
    ['Products updated', s.products_updated],
    ['Unchanged', s.products_unchanged],
    ['Brand prices', s.brand_prices],
    ['New brands', s.brands_new.length],
    ['Brands updated', s.brands_updated],
    ...(s.products_hidden ? [['To hide', s.products_hidden]] : []),
  ];

  return (
    <Card className="space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">3. {preview.ok ? 'Ready to import' : 'Fix these in the Excel, then check again'}</h2>
        {preview.ok && (
          <Button onClick={onImport} disabled={Boolean(busy)}>
            {busy === 'import' ? 'Importing…' : 'Import'}
          </Button>
        )}
      </div>

      {!preview.ok && (
        <div>
          <p className="mb-2 text-sm font-medium text-primary">
            {plural(preview.error_count, 'problem')} found — nothing has been imported.
            {preview.error_count > errors.length ? ` Showing the first ${errors.length}.` : ''}
          </p>
          <div className="max-h-96 overflow-auto rounded-xl ring-1 ring-line">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface text-left text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Sheet</th>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Problem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {errors.map((e, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap px-3 py-2">{e.sheet}</td>
                    <td className="px-3 py-2 font-mono text-xs">{e.row}</td>
                    <td className="px-3 py-2">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.ok && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {tiles.map(([label, value]) => (
            <div key={label} className={`rounded-xl p-3 ring-1 ${label === 'To hide' ? 'bg-primary/5 ring-primary/30' : 'ring-line'}`}>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-semibold">Good to know</h3>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.ok && (
        <div className="grid gap-4 md:grid-cols-2">
          {samples.new.length > 0 && (
            <Sample title={`New products${s.products_new > samples.new.length ? ` (first ${samples.new.length} of ${s.products_new})` : ''}`}>
              {samples.new.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </Sample>
          )}
          {samples.updated.length > 0 && (
            <Sample title={`Changes${s.products_updated > samples.updated.length ? ` (first ${samples.updated.length} of ${s.products_updated})` : ''}`}>
              {samples.updated.map((u) => (
                <li key={u.name}>
                  <span className="font-medium text-ink">{u.name}</span>
                  {u.changes.map((c) => (
                    <span key={c} className="block text-xs">
                      {c}
                    </span>
                  ))}
                </li>
              ))}
            </Sample>
          )}
          {samples.hidden.length > 0 && (
            <Sample title={`To hide${s.products_hidden > samples.hidden.length ? ` (first ${samples.hidden.length} of ${s.products_hidden})` : ''}`}>
              {samples.hidden.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </Sample>
          )}
        </div>
      )}
    </Card>
  );
}

function Sample({ title, children }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <ul className="max-h-72 space-y-1.5 overflow-auto rounded-xl p-3 text-sm text-muted ring-1 ring-line">{children}</ul>
    </div>
  );
}
