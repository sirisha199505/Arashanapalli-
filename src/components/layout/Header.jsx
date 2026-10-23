import { COMPANY } from '../../data/catalog';
import { NAV_LINKS } from '../../data/content';
import useScrolled from '../../hooks/useScrolled';
import { Icon, Logo, SearchBar } from '../ui';

/** Frosted header floating over the hero; turns solid once the page scrolls. */
export default function Header({ quoteCount, onOpenQuotes, onGetQuote, search, onSearch, onSearchSubmit }) {
  const scrolled = useScrolled();
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 backdrop-blur-xl transition-[background-color,box-shadow] duration-300 ${
        scrolled ? 'bg-surface/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)]' : 'bg-surface/55'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <Logo className="h-10 w-10" />
          <span className="min-w-0 font-display text-xl font-semibold leading-[1.05] text-primary">
            {COMPANY.name.split(' ').map((word) => (
              <span key={word} className="block truncate">
                {word}
              </span>
            ))}
          </span>
        </a>

        <nav className="hidden flex-1 justify-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="px-3 py-2 text-sm font-semibold text-ink/80 transition hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <div className="hidden w-60 lg:block">
            <SearchBar size="pill" value={search} onChange={onSearch} onSubmit={onSearchSubmit} />
          </div>
          <div className="hidden sm:block">
            <button onClick={onOpenQuotes} aria-label={`My quotes (${quoteCount})`} className="relative grid h-10 w-10 place-items-center rounded-full text-ink/70 hover:bg-ink/5 hover:text-ink">
              <Icon name="file" />
              {quoteCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{quoteCount}</span>
              )}
            </button>
          </div>
          <button onClick={onGetQuote} className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover sm:inline-flex">
            Get a Quote <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
