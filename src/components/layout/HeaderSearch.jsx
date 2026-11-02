import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS } from '../../data/catalog';
import { getQuery, navigate } from '../../hooks/useRoute';
import { categoryPath, getCategories, getCategoryBySlug, getStartingPrice, parseCode, productPath, searchCatalog } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import ProductImage from '../product/ProductImage';
import { Icon } from '../ui';

const MAX_SUGGESTIONS = 6;

// the category of the page being viewed, so the dropdown starts on it
const categoryFromPath = (path) => (path.startsWith('/category/') ? getCategoryBySlug(path.slice('/category/'.length)) ?? '' : '');

/**
 * Site-wide search (Amazon style): category dropdown, live suggestions, Enter for full results.
 * An exact code opens that product directly — the sales team's quickest lookup: a shelf code ('1002', 'AT1002'),
 * or a dynamic code ('AT1002-HET'), which also picks the brand.
 */
export default function HeaderSearch({ path, className = '' }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);

  // show what the current listing is searching for
  const urlQuery = getQuery().get('q') ?? '';
  useEffect(() => {
    const onListing = path === '/products' || path.startsWith('/category/');
    setText(onListing ? urlQuery : '');
    setCategory(categoryFromPath(path));
    setOpen(false);
  }, [path, urlQuery]);

  const term = useDeferredValue(text).trim();
  const suggestions = useMemo(
    () => (term ? searchCatalog(PRODUCTS, { search: term, category: category || null }).results.slice(0, MAX_SUGGESTIONS) : []),
    [term, category],
  );

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const showResults = () => {
    const q = text.trim();
    const { product, brand } = parseCode(q);
    setOpen(false);
    if (product) return navigate(`${productPath(product)}${brand ? `?brand=${brand.id}` : ''}`);
    navigate(`${category ? categoryPath(category) : '/products'}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      const n = suggestions.length;
      if (n) setHighlight((h) => (e.key === 'ArrowDown' ? (h + 1) % n : (h - 1 + n) % n));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (highlight >= 0 && suggestions[highlight]) {
            setOpen(false);
            navigate(productPath(suggestions[highlight]));
          } else {
            showResults();
          }
        }}
        className="flex h-10 overflow-hidden rounded-lg border border-line bg-surface shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      >
        <select
          aria-label="Search in category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          // sized to the chosen option (like Amazon's "All ▾"), not the longest category name
          style={{ width: `calc(${Math.min((category || 'All').length, 16)}ch + 2.25rem)` }}
          className="max-w-24 shrink-0 cursor-pointer truncate border-r border-line bg-surface-2 pl-2.5 text-xs font-medium text-ink/80 outline-none sm:max-w-48"
        >
          <option value="">All</option>
          {getCategories().map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products or code"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted"
        />
        <button type="submit" aria-label="Search" className="grid w-11 shrink-0 place-items-center bg-primary text-white hover:bg-primary-hover">
          <Icon name="search" className="h-5 w-5" />
        </button>
      </form>

      {open && term && (
        <div id="search-suggestions" className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-xl">
          {suggestions.length ? (
            <ul role="listbox" aria-label="Suggestions">
              {suggestions.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === highlight}>
                  <a
                    href={productPath(p)}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 ${i === highlight ? 'bg-surface-2' : ''}`}
                  >
                    <ProductImage product={p} className="h-10 w-10 shrink-0 rounded-md border border-line" padding="p-1" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                      <span className="block truncate text-xs text-muted">
                        <span className="font-mono font-semibold">{p.code}</span> · {p.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">{formatCurrency(getStartingPrice(p))}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted">No products match “{term}”.</p>
          )}
          <button type="button" onClick={showResults} className="block w-full border-t border-line px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-surface-2">
            See all results for “{term}”{category && ` in ${category}`}
          </button>
        </div>
      )}
    </div>
  );
}
