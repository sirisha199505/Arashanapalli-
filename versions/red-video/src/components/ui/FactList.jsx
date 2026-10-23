/** Renders [{ key, label, value }] as a definition grid. */
export default function FactList({ facts, className = '' }) {
  return (
    <dl className={`grid gap-5 ${className}`}>
      {facts.map((f) => (
        <div key={f.key}>
          <dt className="text-xs font-medium uppercase tracking-wider text-muted">{f.label}</dt>
          <dd className="mt-1 text-sm font-semibold">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
