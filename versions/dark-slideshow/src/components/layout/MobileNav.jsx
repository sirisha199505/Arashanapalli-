import { Icon } from '../ui';

const ITEMS = [
  { href: '#top', icon: 'home', label: 'Home' },
  { href: '#products', icon: 'grid', label: 'Products' },
  { href: '#brands', icon: 'tag', label: 'Brands' },
];

const itemClass = 'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted hover:text-primary';

/** Bottom app-style bar on phones. */
export default function MobileNav({ quoteCount, onOpenQuotes }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
      {ITEMS.map((item) => (
        <a key={item.href} href={item.href} className={itemClass}>
          <Icon name={item.icon} />
          {item.label}
        </a>
      ))}
      <button onClick={onOpenQuotes} className={`${itemClass} relative`}>
        <Icon name="file" />
        Quotes
        {quoteCount > 0 && (
          <span className="absolute right-[calc(50%-20px)] top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-white">
            {quoteCount}
          </span>
        )}
      </button>
    </nav>
  );
}
