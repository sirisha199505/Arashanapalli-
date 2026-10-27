const rowClass = (active) =>
  `flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
    active ? 'bg-primary/10 font-semibold text-primary' : 'text-ink/80 hover:bg-surface-2'
  }`;

/**
 * Single-choice category list with result counts; `null` = all categories.
 * `showAll` adds the "All categories" row; `badges` (category → number) shows e.g. how many are already in the quote.
 * `allowEmpty` keeps categories with a zero count clickable.
 */
export default function CategoryList({ categories, active, counts, total, onChange, showAll = true, badges = {}, allowEmpty = false, allLabel = 'All categories' }) {
  return (
    <ul className="space-y-0.5">
      {showAll && (
        <li>
          <button type="button" className={rowClass(!active)} onClick={() => onChange(null)}>
            {allLabel} <span className="text-xs text-muted">{total}</span>
          </button>
        </li>
      )}
      {categories.map((c) => (
        <li key={c}>
          <button type="button" className={rowClass(active === c)} onClick={() => onChange(c)} disabled={!allowEmpty && !counts[c]} aria-current={active === c || undefined}>
            <span className={counts[c] || allowEmpty ? '' : 'opacity-40'}>{c}</span>
            {badges[c] ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white" title={`${badges[c]} in your quote`}>
                {badges[c]}
              </span>
            ) : (
              <span className="text-xs text-muted">{counts[c] ?? 0}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
