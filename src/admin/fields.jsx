// Form controls for the admin pages, styled like components/ui/TextField.
const control = 'w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const Label = ({ id, label, children }) => (
  <label htmlFor={id} className="block">
    <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
    {children}
  </label>
);

export function SelectField({ id, label, options, ...props }) {
  return (
    <Label id={id} label={label}>
      <select id={id} className={control} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Label>
  );
}

export function TextAreaField({ id, label, rows = 3, ...props }) {
  return (
    <Label id={id} label={label}>
      <textarea id={id} rows={rows} className={control} {...props} />
    </Label>
  );
}

export function CheckboxField({ id, label, ...props }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input id={id} type="checkbox" className="h-4 w-4 accent-primary" {...props} />
      {label}
    </label>
  );
}

/** Red message box for a failed request. */
export function ErrorNote({ error }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
      {error.message ?? String(error)}
    </p>
  );
}

/** Previous / next page buttons. */
export function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const btn = 'rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-line hover:ring-primary disabled:opacity-40 disabled:hover:ring-line';
  return (
    <div className="flex items-center justify-end gap-3 text-sm text-muted">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      Page {page} of {totalPages}
      <button className={btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
