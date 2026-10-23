import { COMPANY } from '../../data/catalog';
import { NAV_LINKS } from '../../data/content';
import useScrolled from '../../hooks/useScrolled';
import { Button, Icon, Logo, SearchBar } from '../ui';

/** Floats over the page: fully transparent at the top, frosted glass once scrolled. */
export default function Header({ quoteCount, onOpenQuotes, search, onSearch, onSearchSubmit }) {
  const scrolled = useScrolled();
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-white/10 bg-bg/70 shadow-lg shadow-black/20 backdrop-blur-xl backdrop-saturate-150' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <Logo className="h-10 w-10 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-extrabold tracking-tight">{COMPANY.name}</span>
            <span className="block truncate text-[11px] font-medium text-muted">{COMPANY.tagline}</span>
          </span>
        </a>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden w-64 md:block">
            <SearchBar value={search} onChange={onSearch} onSubmit={onSearchSubmit} />
          </div>
          <div className="hidden sm:block">
            <Button onClick={onOpenQuotes}>
              <Icon name="file" className="h-4 w-4" /> Quotes
              <span className="rounded-md bg-white/20 px-1.5 text-xs">{quoteCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
