import { useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS } from '../../data/catalog';
import usePageMeta from '../../hooks/usePageMeta';
import { navigate } from '../../hooks/useRoute';
import { SORT_OPTIONS, categoryPath, getBrand, getCategories, getProductByCode, getStartingPrice, searchCatalog, shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import { Button, Card, Icon } from '../ui';
import AddProductsPanel from '../quote/AddProductsPanel';
import NewArrivalsStrip from './NewArrivalsStrip';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import ProductImage from './ProductImage';

const PAGE_SIZE = 24;

const PRICE_BANDS = [
  { id: 'under-500', label: 'Under ₹500', test: (p) => p < 500 },
  { id: '500-2000', label: '₹500 – ₹2,000', test: (p) => p >= 500 && p < 2000 },
  { id: '2000-10000', label: '₹2,000 – ₹10,000', test: (p) => p >= 2000 && p < 10000 },
  { id: 'over-10000', label: 'Over ₹10,000', test: (p) => p >= 10000 },
];

/** Filters live in the address (?q=…&brand=…&price=…&sort=…) so any listing can be shared as a link. */
const readFilters = (query) => ({
  search: query.get('q') ?? '',
  brandIds: (query.get('brand') ?? '').split(',').filter(Boolean),
  price: query.get('price') ?? '',
  sort: query.get('sort') ?? 'relevance',
});

// `page` is only kept when asked for — any filter change starts again at page 1
const toQueryString = ({ search, brandIds, price, sort, page = 1 }) => {
  const q = new URLSearchParams();
  if (search.trim()) q.set('q', search.trim());
  if (brandIds.length) q.set('brand', brandIds.join(','));
  if (price) q.set('price', price);
  if (sort !== 'relevance') q.set('sort', sort);
  if (page > 1) q.set('page', page);
  const s = q.toString();
  return s ? `?${s}` : '';
};

const basePath = (category) => (category ? categoryPath(category) : '/products');

/** Shop-style listing for /products and /category/<slug>: filter sidebar, sort, search (names, brands and shelf codes). */
export default function ProductListing({ category, query, onQuote, compareIds, onToggleCompare }) {
  const filters = readFilters(query);
  const requestedPage = Math.max(1, parseInt(query.get('page'), 10) || 1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const update = (patch) => navigate(basePath(category) + toQueryString({ ...filters, ...patch }));

  const { results, brandCounts } = useMemo(
    () => searchCatalog(PRODUCTS, { search: filters.search, category, brandIds: filters.brandIds, sort: filters.sort }),
    [filters.search, category, filters.brandIds.join(','), filters.sort], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const band = PRICE_BANDS.find((b) => b.id === filters.price);
  const products = band ? results.filter((p) => band.test(getStartingPrice(p))) : results;
  const codeMatch = getProductByCode(filters.search);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const shown = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // a new page of results starts at the top, as it would on a fresh page load
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) firstRender.current = false;
    else window.scrollTo({ top: 0, behavior: 'instant' }); // the site scrolls smoothly; a new page should just start at the top
  }, [page]);
  const brandsHere = Object.keys(brandCounts)
    .map(getBrand)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
  const activeCount = filters.brandIds.length + (filters.price ? 1 : 0);

  const title = category ?? 'All Products';
  const range = products.length ? `${((page - 1) * PAGE_SIZE + 1).toLocaleString('en-IN')}–${((page - 1) * PAGE_SIZE + shown.length).toLocaleString('en-IN')} of ` : '';
  usePageMeta({
    title: category ?? 'Products',
    description: category
      ? `${category} at Arashanapalli Traders, Secunderabad — ${results.length} products from brands like ${brandsHere.slice(0, 4).map(shortBrandName).join(', ')}. Compare brands and get an instant quote.`
      : 'Browse door hardware, plywood, laminates, kitchen and furniture fittings at Arashanapalli Traders, Secunderabad. Compare brands and get an instant quote.',
    image: category ? results.find((p) => p.image)?.image : undefined,
  });

  // the left column is where customers choose products for their quote
  const sidebar = <AddProductsPanel key={category ?? 'all'} category={category} />;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-[calc(var(--header-h)+1.25rem)] sm:pb-14">
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
        <a href="/" className="hover:text-primary">
          Home
        </a>
        <Icon name="chevronRight" className="h-3 w-3" />
        {category ? (
          <>
            <a href="/products" className="hover:text-primary">
              Products
            </a>
            <Icon name="chevronRight" className="h-3 w-3" />
            <span className="text-ink">{category}</span>
          </>
        ) : (
          <span className="text-ink">Products</span>
        )}
      </nav>

      <div className="mb-5">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-muted">
          {range}
          {products.length.toLocaleString('en-IN')} result{products.length === 1 ? '' : 's'}
          {filters.search && (
            <>
              {' '}for <span className="font-semibold text-primary">“{filters.search}”</span>
              <a href={basePath(category) + toQueryString({ ...filters, search: '' })} className="ml-2 text-xs underline hover:text-primary">
                clear
              </a>
            </>
          )}
        </p>
      </div>


      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* left: choose products for the quote (brand first, product first or packages) */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>{sidebar}</aside>

        <div className="min-w-0 space-y-4">
          {codeMatch && <CodeMatch product={codeMatch} onQuote={onQuote} />}
          {category && !filters.search && !activeCount && <NewArrivalsStrip category={category} onQuote={onQuote} compareIds={compareIds} onToggleCompare={onToggleCompare} />}
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
              {filtersOpen ? 'Hide product selector' : 'Select products'}
            </Button>
            <label className="ml-auto flex items-center gap-2 text-sm text-muted">
              Sort by
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value })}
                className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {activeCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Showing only:</span>
              {filters.brandIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ brandIds: filters.brandIds.filter((b) => b !== id) })}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  {getBrand(id) ? shortBrandName(getBrand(id)) : id} <Icon name="close" className="h-3 w-3" />
                </button>
              ))}
              {band && (
                <button type="button" onClick={() => update({ price: '' })} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20">
                  {band.label} <Icon name="close" className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
          {/* three across: the product selector takes the left of the page */}
          <ProductGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" products={shown} onQuote={onQuote} compareIds={compareIds} onToggleCompare={onToggleCompare} />
          <Pagination page={page} totalPages={totalPages} hrefFor={(n) => basePath(category) + toQueryString({ ...filters, page: n })} />
        </div>
      </div>
    </main>
  );
}



/** Shown when the search is exactly a shelf code — the sales team's quick lookup. */
function CodeMatch({ product, onQuote }) {
  return (
    <Card className="flex items-center gap-4 border-primary/40 bg-primary/5 p-4">
      <ProductImage product={product} className="h-16 w-16 shrink-0 rounded-xl border border-line" padding="p-1" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Product code {product.code}</p>
        <p className="truncate font-semibold">{product.name}</p>
        <p className="text-sm text-muted">
          {product.category} · from {formatCurrency(getStartingPrice(product))} / {product.unit}
        </p>
      </div>
      <Button size="sm" onClick={() => onQuote(product)}>
        Add to quote
      </Button>
    </Card>
  );
}
