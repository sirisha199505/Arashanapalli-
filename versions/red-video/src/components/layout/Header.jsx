import { COMPANY } from '../../data/catalog';
import { NAV_LINKS } from '../../data/content';
import useScrolled from '../../hooks/useScrolled';
import { Button, Icon, Logo, SearchBar } from '../ui';

/** Sticky charcoal header; turns to frosted glass once the page scrolls. */
export default function Header({ quoteCount, onOpenQuotes, onGetQuote, search, onSearch, onSearchSubmit }) {
  const scrolled = useScrolled();
  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 text-white transition-[background-color,box-shadow] duration-300 ${
        scrolled ? 'bg-brand/85 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl' : 'bg-brand'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <Logo className="h-11 w-11" />
          <span className="hidden h-9 w-px bg-white/25 sm:block" />
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-xl font-semibold tracking-tight">{COMPANY.name}</span>
            <span className="mt-1 block truncate text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">{COMPANY.tagline}</span>
          </span>
        </a>

        <nav className="hidden flex-1 justify-center gap-1 xl:flex">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 text-sm font-semibold transition hover:text-primary after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:bg-primary after:transition-transform ${
                i === 0 ? 'text-primary after:scale-x-100' : 'text-white/85 after:scale-x-0 hover:after:scale-x-100'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <div className="hidden w-56 lg:block">
            <SearchBar size="pill" tone="dark" value={search} onChange={onSearch} onSubmit={onSearchSubmit} />
          </div>
          <div className="hidden sm:block">
            <button onClick={onOpenQuotes} aria-label={`My quotes (${quoteCount})`} className="relative grid h-10 w-10 place-items-center rounded-lg text-white/85 hover:bg-white/10 hover:text-white">
              <Icon name="file" />
              {quoteCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold">{quoteCount}</span>
              )}
            </button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={onGetQuote}>Get a Quote</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
