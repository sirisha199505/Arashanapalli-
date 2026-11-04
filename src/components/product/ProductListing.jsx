import { useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS } from '../../data/catalog';
import usePageMeta from '../../hooks/usePageMeta';
import { navigate } from '../../hooks/useRoute';
import { SORT_OPTIONS, categoryPath, getBrand, getCategoryTree, getProductByCode, getStartingPrice, groupByType, searchCatalog, shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import { Button, Card, Icon, SearchBar } from '../ui';
import BrandBar from './BrandBar';
import CategoryTree from './CategoryTree';
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

/** Filters live in the address (?sub=…&q=…&brand=…&price=…&sort=…) so any listing can be shared as a link. */
const readFilters = (query) => ({
  sub: query.get('sub') ?? '',
  search: query.get('q') ?? '',
  brandIds: (query.get('brand') ?? '').split(',').filter(Boolean),
  price: query.get('price') ?? '',
  fresh: query.get('new') === '1',
  sort: query.get('sort') ?? 'relevance',
});

// `page` is only kept when asked for — any filter change starts again at page 1
const toQueryString = ({ sub, search, brandIds, price, fresh, sort, page = 1 }) => {
  const q = new URLSearchParams();
  if (sub) q.set('sub', sub);
  if (search.trim()) q.set('q', search.trim());
  if (brandIds.length) q.set('brand', brandIds.join(','));
  if (price) q.set('price', price);
  if (fresh) q.set('new', '1');
  if (sort !== 'relevance') q.set('sort', sort);
  if (page > 1) q.set('page', page);
  const s = q.toString();
  return s ? `?${s}` : '';
};

const basePath = (category) => (category ? categoryPath(category) : '/products');

/**
 * Shop-style listing for /products and /category/<slug>, the Amazon way: categories (and their subcategories) down the left,
 * brands across the top, then sort and search (names, brands and shelf codes).
 */
export default function ProductListing({ category, query, onQuote, compareIds, onToggleCompare }) {
  const filters = readFilters(query);
  const requestedPage = Math.max(1, parseInt(query.get('page'), 10) || 1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // what's typed in the page's search box; it searches when Search is pressed (or Enter)
  const [typed, setTyped] = useState(filters.search);
  useEffect(() => setTyped(filters.search), [filters.search]);

  const update = (patch) => navigate(basePath(category) + toQueryString({ ...filters, ...patch }));

  // the category tree counts what the search finds, before brands narrow it
  const tree = useMemo(() => getCategoryTree(searchCatalog(PRODUCTS, { search: filters.search }).results), [filters.search]);
  const subcategory = category ? tree.find((n) => n.category === category)?.subcategories.find((s) => s.slug === filters.sub) : undefined;
  const inScope = subcategory ? PRODUCTS.filter((p) => p.category === category && p.subcategory === subcategory.name) : PRODUCTS;
  const { results } = useMemo(
    () => searchCatalog(inScope, { search: filters.search, category, brandIds: filters.brandIds, sort: filters.sort }),
    [filters.search, category, subcategory?.name, filters.brandIds.join(','), filters.sort], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // brands counted per product type (as the cards show), before the brand filter narrows the list
  const brandCounts = useMemo(() => {
    const counts = {};
    groupByType(searchCatalog(inScope, { search: filters.search, category }).results).forEach((p) => p.brandIds.forEach((id) => (counts[id] = (counts[id] ?? 0) + 1)));
    return counts;
  }, [filters.search, category, subcategory?.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const band = PRICE_BANDS.find((b) => b.id === filters.price);
  // one card per product type: its sizes / shades are picked on the product page
  const products = groupByType(results.filter((p) => (!band || band.test(getStartingPrice(p))) && (!filters.fresh || p.newArrival)));
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
  // most products first, so the brands that matter here lead the bar
  const brandsHere = Object.entries(brandCounts)
    .map(([id, count]) => ({ brand: getBrand(id), count }))
    .filter((b) => b.brand)
    .sort((a, b) => b.count - a.count || a.brand.name.localeCompare(b.brand.name));
  const activeCount = filters.brandIds.length + (filters.price ? 1 : 0) + (filters.fresh ? 1 : 0);
  // a category link keeps the search but starts the brands afresh (they differ per category)
  const categoryHref = (c, sub) => basePath(c) + toQueryString({ ...filters, sub: sub ?? '', brandIds: [] });

  const title = subcategory?.name ?? category ?? 'All Products';
  const range = products.length ? `${((page - 1) * PAGE_SIZE + 1).toLocaleString('en-IN')}–${((page - 1) * PAGE_SIZE + shown.length).toLocaleString('en-IN')} of ` : '';
  usePageMeta({
    title: category ? title : 'Products',
    description: category
      ? `${title} at Arashanapalli Traders, Secunderabad — ${results.length} products from brands like ${brandsHere.slice(0, 4).map((b) => shortBrandName(b.brand)).join(', ')}. Compare brands and get an instant quote.`
      : 'Browse door hardware, plywood, laminates, kitchen and furniture fittings at Arashanapalli Traders, Secunderabad. Compare brands and get an instant quote.',
    image: category ? results.find((p) => p.image)?.image : undefined,
  });


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
            {subcategory ? (
              <>
                <a href={categoryHref(category)} className="hover:text-primary">
                  {category}
                </a>
                <Icon name="chevronRight" className="h-3 w-3" />
                <span className="text-ink">{subcategory.name}</span>
              </>
            ) : (
              <span className="text-ink">{category}</span>
            )}
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


      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/* left: categories, each opening to its subcategories */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:block lg:max-h-[calc(100vh-var(--header-h)-2rem)] lg:self-start lg:overflow-y-auto lg:border-r lg:border-line lg:pr-4`}>
          <CategoryTree key={category ?? 'all'} tree={tree} category={category} subcategory={subcategory?.slug} hrefFor={categoryHref} />
          <FilterSection title="New Arrivals">
            <label className="flex cursor-pointer items-center gap-2 py-1 text-sm hover:text-primary">
              <input type="checkbox" checked={filters.fresh} onChange={(e) => update({ fresh: e.target.checked })} className="h-4 w-4 accent-[var(--primary)]" />
              New arrivals only
            </label>
          </FilterSection>
          <FilterSection title="Price">
            {band && (
              <button type="button" onClick={() => update({ price: '' })} className="flex items-center gap-0.5 py-1 text-sm hover:text-primary hover:underline">
                <Icon name="chevronLeft" className="h-3 w-3" /> Any price
              </button>
            )}
            {PRICE_BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => update({ price: b.id })}
                aria-pressed={b.id === filters.price}
                className={`block py-1 text-left text-sm hover:text-primary hover:underline ${b.id === filters.price ? 'font-bold' : ''}`}
              >
                {b.label}
              </button>
            ))}
          </FilterSection>
        </aside>

        <div className="min-w-0 space-y-4">
          {/* search within what's chosen (category, subcategory, brands) */}
          <SearchBar
            size="lg"
            value={typed}
            onChange={setTyped}
            onSubmit={() => update({ search: typed })}
            placeholder={`Search in ${title === 'All Products' ? 'all products' : title} — name, brand or code`}
          />
          {/* top: brands in this category — pick one or more to see only their products */}
          <BrandBar brands={brandsHere} selected={filters.brandIds} onChange={(brandIds) => update({ brandIds })} />
          {codeMatch && <CodeMatch product={codeMatch} onQuote={onQuote} />}
          {category && !subcategory && !filters.search && !activeCount && <NewArrivalsStrip category={category} onQuote={onQuote} compareIds={compareIds} onToggleCompare={onToggleCompare} />}
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
              <Icon name="grid" className="h-4 w-4" /> {filtersOpen ? 'Hide filters' : 'Categories & filters'}
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
          {/* three across: the filters take the left of the page */}
          <ProductGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" products={shown} onQuote={onQuote} compareIds={compareIds} onToggleCompare={onToggleCompare} />
          <Pagination page={page} totalPages={totalPages} hrefFor={(n) => basePath(category) + toQueryString({ ...filters, page: n })} />
        </div>
      </div>
    </main>
  );
}



/** One block of the left-hand filters, under its bold heading (as on Amazon). */
function FilterSection({ title, children }) {
  return (
    <section className="mt-5">
      <h2 className="mb-1.5 text-sm font-bold text-ink">{title}</h2>
      {children}
    </section>
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
