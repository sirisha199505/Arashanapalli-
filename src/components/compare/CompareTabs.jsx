const TABS = [
  { href: '/compare', label: 'Compare brands' },
  { href: '/compare/quotes', label: 'Compare quotations' },
];

/** Switch between the two comparisons. */
export default function CompareTabs({ path }) {
  return (
    <nav aria-label="Comparisons" className="inline-flex rounded-xl bg-surface-2 p-1">
      {TABS.map((t) => (
        <a
          key={t.href}
          href={t.href}
          aria-current={path === t.href ? 'page' : undefined}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${path === t.href ? 'bg-surface text-primary shadow-sm' : 'text-ink/70 hover:text-ink'}`}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}
