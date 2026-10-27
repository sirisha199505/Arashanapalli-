export default function TextField({ label, id, error, hint, ...props }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 ${
          error ? 'border-primary focus:ring-primary/20' : 'border-line focus:border-primary focus:ring-primary/20'
        }`}
        {...props}
      />
      {error ? (
        <span id={`${id}-error`} role="alert" className="mt-1 block text-xs font-medium text-primary">
          {error}
        </span>
      ) : (
        hint && <span id={`${id}-hint`} className="mt-1 block text-xs text-muted">{hint}</span>
      )}
    </label>
  );
}
