export default function TextField({ label, id, ...props }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        id={id}
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </label>
  );
}
