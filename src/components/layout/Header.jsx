import { useEffect, useState } from 'react';
import { COMPANY } from '../../data/catalog';
import { NAV_LINKS } from '../../data/content';
import useScrolled from '../../hooks/useScrolled';
import { Icon, Logo } from '../ui';
import HeaderSearch from './HeaderSearch';

const linkClass = (active) => `font-semibold transition hover:text-primary ${active ? 'text-primary' : 'text-ink/80'}`;

/**
 * Fixed header, Amazon style: logo · search (category dropdown + suggestions) · quote buttons.
 * Phones put the search on its own row; desktop adds a row of page links; tablets keep the links in a menu.
 * Its height per screen size is --header-h in index.css — keep the two in step.
 */
export default function Header({ path, quoteCount, onOpenQuotes, onGetQuote }) {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  // close the menu once a link has opened its page
  useEffect(() => setMenuOpen(false), [path]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 backdrop-blur-xl transition-[background-color,box-shadow] duration-300 ${
        menuOpen ? 'bg-surface shadow-[0_8px_30px_rgba(0,0,0,0.08)]' : scrolled ? 'bg-surface/95 shadow-[0_8px_30px_rgba(0,0,0,0.08)]' : 'bg-surface/80'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:gap-6">
        <a href="/" className="flex min-w-0 shrink-0 items-center gap-3">
          <Logo className="h-10 w-10" />
          <span className="min-w-0 font-display text-xl font-semibold leading-[1.05] text-primary">
            {COMPANY.name.split(' ').map((word) => (
              <span key={word} className="block truncate">
                {word}
              </span>
            ))}
          </span>
        </a>

        <HeaderSearch path={path} className="hidden flex-1 md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <a href="/account" aria-label="My quotations (sign in)" className="hidden h-10 w-10 place-items-center rounded-full text-ink/70 hover:bg-ink/5 hover:text-ink sm:grid">
            <Icon name="users" />
          </a>
          <button onClick={onOpenQuotes} aria-label={`My quotes (${quoteCount})`} className="relative hidden h-10 w-10 place-items-center rounded-full text-ink/70 hover:bg-ink/5 hover:text-ink sm:grid">
            <Icon name="file" />
            {quoteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{quoteCount}</span>
            )}
          </button>
          <button onClick={onGetQuote} className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover lg:inline-flex">
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

      {/* phones: search gets its own full-width row */}
      <div className="px-4 pb-3 md:hidden">
        <HeaderSearch path={path} />
      </div>

      {/* desktop: page links row */}
      <nav aria-label="Main" className="hidden h-10 border-t border-line/70 xl:block">
        {/* px-1 + each link's px-3 puts the first link's text in line with the logo above */}
        <ul className="mx-auto flex h-full max-w-7xl items-center gap-1 px-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} aria-current={path === link.href ? 'page' : undefined} className={`px-3 py-2 text-sm ${linkClass(path === link.href)}`}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

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
