import { useEffect, useState } from 'react';
import { COMPANY } from '../../data/catalog';
import { NAV_LINKS } from '../../data/content';
import useScrolled from '../../hooks/useScrolled';
import { Icon, Logo } from '../ui';

const linkClass = (active) => `font-semibold transition hover:text-primary ${active ? 'text-primary' : 'text-ink/80'}`;

/** Frosted header floating over the hero; turns solid once the page scrolls. Below xl the links move into a menu. */
export default function Header({ path, quoteCount, onOpenQuotes, onGetQuote }) {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  // close the menu once a link has opened its page
  useEffect(() => setMenuOpen(false), [path]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 backdrop-blur-xl transition-[background-color,box-shadow] duration-300 ${
        menuOpen ? 'bg-surface shadow-[0_8px_30px_rgba(0,0,0,0.08)]' : scrolled ? 'bg-surface/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)]' : 'bg-surface/55'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <a href="/" className="flex min-w-0 items-center gap-3">
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
            <a
              key={link.href}
              href={link.href}
              aria-current={path === link.href ? 'page' : undefined}
              className={`px-3 py-2 text-sm ${linkClass(path === link.href)}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
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
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="grid h-10 w-10 place-items-center rounded-full text-ink/80 hover:bg-ink/5 hover:text-ink xl:hidden"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="site-menu" className="border-t border-line px-4 pb-4 xl:hidden">
          <ul className="mx-auto max-w-7xl divide-y divide-line">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setMenuOpen(false)} aria-current={path === link.href ? 'page' : undefined} className={`block py-3 text-base ${linkClass(path === link.href)}`}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
