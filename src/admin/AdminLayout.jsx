import { useEffect, useState } from 'react';
import { COMPANY } from '../data/catalog';
import { Icon, Logo } from '../components/ui';

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'A';

// soft brand-red wash at the top of the page over a faint dot pattern
const CANVAS = {
  backgroundImage:
    'linear-gradient(180deg, rgba(168, 32, 36, 0.07), rgba(168, 32, 36, 0) 22rem), radial-gradient(rgba(168, 32, 36, 0.09) 1px, transparent 1px)',
  backgroundSize: '100% 100%, 22px 22px',
};

/** Admin chrome: sidebar (collapsible on desktop, a drawer on phones) and the top bar. */
export default function AdminLayout({ sections, path, page, session, awaiting, onSearch, onNavigate, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [path]);

  const sidebar = (compact) => (
    <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.title ?? 'main'}>
          {section.title && !compact && <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{section.title}</p>}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = item.path === page.path;
              return (
                <li key={item.path}>
                  <a
                    href={item.path}
                    title={compact ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${compact ? 'justify-center' : ''} ${
                      active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-ink/80 hover:bg-surface-2 hover:text-ink'
                    }`}
                  >
                    <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                    {!compact && item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (compact) => (
    <div className={`flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 ${compact ? 'justify-center' : ''}`}>
      <Logo className="h-9 w-9 shrink-0" />
      {!compact && <span className="truncate font-display text-lg font-semibold">{COMPANY.name}</span>}
    </div>
  );

  return (
    <div className="flex min-h-svh bg-bg">
      {/* desktop sidebar */}
      <aside className={`sticky top-0 hidden h-svh shrink-0 flex-col border-r border-line bg-surface transition-[width] lg:flex ${collapsed ? 'w-20' : 'w-64'}`}>
        {brand(collapsed)}
        {sidebar(collapsed)}
      </aside>

      {/* phone / tablet drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <aside className="flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {brand(false)}
            {sidebar(false)}
          </aside>
        </div>
      )}

      <div style={CANVAS} className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur sm:gap-3 sm:px-5">
          <button
            onClick={() => (window.matchMedia('(min-width: 1024px)').matches ? setCollapsed((c) => !c) : setDrawerOpen(true))}
            aria-label="Toggle menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
          >
            <Icon name="menu" />
          </button>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (search.trim()) onSearch(search.trim());
            }}
            className="relative hidden max-w-md flex-1 md:block"
          >
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotes, customers, products…"
              aria-label="Search the admin"
              className="w-full rounded-xl border border-line bg-bg py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:bg-surface"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover sm:inline-flex"
            >
              <Icon name="external" className="h-4 w-4" /> View Website
            </a>
            <button
              onClick={() => onNavigate('/admin/quotes', { status: 'new' })}
              aria-label={`${awaiting} quote requests awaiting a reply`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
            >
              <Icon name="bell" />
              {awaiting > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{awaiting}</span>
              )}
            </button>

            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-haspopup="menu" className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">{initials(session.name)}</span>
                <span className="hidden text-left leading-tight md:block">
                  <span className="block max-w-40 truncate text-sm font-semibold">{session.name || session.email}</span>
                  <span className="block text-xs text-muted">Admin</span>
                </span>
                <Icon name="chevronDown" className="hidden h-4 w-4 text-muted md:block" />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-12 w-56 rounded-xl border border-line bg-surface p-1 shadow-xl">
                  <p className="truncate px-3 py-2 text-xs text-muted">{session.email}</p>
                  <a role="menuitem" href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2 sm:hidden">
                    <Icon name="external" className="h-4 w-4" /> View Website
                  </a>
                  <button role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/10">
                    <Icon name="logout" className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{page.label}</h1>
            <p className="mt-1 text-sm text-muted">{page.subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
