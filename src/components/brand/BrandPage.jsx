import { useEffect, useMemo, useRef } from 'react';
import { BRAND_SPEC_FIELDS } from '../../data/catalog';
import usePageMeta from '../../hooks/usePageMeta';
import { navigate } from '../../hooks/useRoute';
import { SORT_OPTIONS, categoryPath, getBrandProducts, getCategories, getUnitPrice, slugify } from '../../utils/catalog';
import Pagination from '../product/Pagination';
import ProductGrid from '../product/ProductGrid';
import { Badge, Card, Chip, Icon } from '../ui';

const PAGE_SIZE = 24;

const SORTERS = {
  priceLow: (brand) => (a, b) => getUnitPrice(a, brand) - getUnitPrice(b, brand),
  priceHigh: (brand) => (a, b) => getUnitPrice(b, brand) - getUnitPrice(a, brand),
  name: () => (a, b) => a.name.localeCompare(b.name),
};

/** /brand/<id>: the brand (class, code, specs), its series, the categories it covers, and its products at its own prices. */
export default function BrandPage({ brand, query, onQuote, compareIds, onToggleCompare }) {
  const seriesId = Number(query.get('series')) || null;
  const categorySlug = query.get('category') ?? '';
  const sort = query.get('sort') ?? 'relevance';
  const requestedPage = Math.max(1, parseInt(query.get('page'), 10) || 1);

  const href = (patch) => {
    const next = { series: seriesId ?? '', category: categorySlug, sort: sort === 'relevance' ? '' : sort, page: '', ...patch };
    const q = new URLSearchParams(Object.entries(next).filter(([, v]) => v !== '' && v != null));
    return `/brand/${brand.id}${q.size ? `?${q}` : ''}`;
  };

  const all = useMemo(() => getBrandProducts(brand), [brand]);
  const inSeries = useMemo(() => getBrandProducts(brand, seriesId), [brand, seriesId]);
  const categories = getCategories().filter((c) => all.some((p) => p.category === c));
  const category = categories.find((c) => slugify(c) === categorySlug);
  const filtered = category ? inSeries.filter((p) => p.category === category) : inSeries;
  const products = SORTERS[sort] ? [...filtered].sort(SORTERS[sort](brand)) : filtered;
  const seriesCount = (id) => all.filter((p) => (p.seriesIds ?? []).includes(id)).length;

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const shown = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) firstRender.current = false;
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  usePageMeta({
    title: `${brand.name} products`,
    description: `${brand.name} (${brand.tier}) at Arashanapalli Traders, Secunderabad — ${all.length} products across ${categories.slice(0, 4).join(', ')}. See prices and get an instant quote.`,
    image: all.find((p) => p.image)?.image,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-[calc(var(--header-h)+1.25rem)] sm:pb-14">
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
        <a href="/" className="hover:text-primary">
          Home
        </a>
        <Icon name="chevronRight" className="h-3 w-3" />
        <a href="/brands" className="hover:text-primary">
          Brands
        </a>
        <Icon name="chevronRight" className="h-3 w-3" />
        <span className="text-ink">{brand.name}</span>
      </nav>

      <Card className="mb-6 grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Class · <span className="text-primary">{brand.tier}</span>
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">{brand.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Brand code <span className="font-mono font-semibold text-ink">{brand.code}</span> · {all.length.toLocaleString('en-IN')} products
            {brand.series?.length ? ` · ${brand.series.length} series` : ''}
          </p>
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold text-muted">Categories — see every brand in each</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <a key={c} href={`${categoryPath(c)}?brand=${brand.id}`} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium hover:bg-primary/10 hover:text-primary">
                  {c}
                </a>
              ))}
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:w-72 md:grid-cols-1">
          {BRAND_SPEC_FIELDS.filter((f) => brand.specs?.[f.key]).map((f) => (
            <div key={f.key}>
              <dt className="text-xs text-muted">{f.label}</dt>
              <dd className="font-medium">{brand.specs[f.key]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {brand.series?.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Series</h2>
          <div className="flex flex-wrap gap-2">
            <Chip active={!seriesId} onClick={() => navigate(href({ series: '' }))}>
              All {brand.name}
            </Chip>
            {brand.series.map((s) => (
              <Chip key={s.id} active={seriesId === s.id} onClick={() => navigate(href({ series: s.id }))} title={s.description ?? undefined}>
                {s.name} <span className="ml-1 opacity-70">{seriesCount(s.id)}</span>
              </Chip>
            ))}
          </div>
          {seriesId && brand.series.find((s) => s.id === seriesId)?.description && (
            <p className="mt-2 text-sm text-muted">{brand.series.find((s) => s.id === seriesId).description}</p>
          )}
        </section>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          aria-label="Category"
          value={categorySlug}
          onChange={(e) => navigate(href({ category: e.target.value }))}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
        >
          <option value="">All categories ({inSeries.length})</option>
          {categories.map((c) => (
            <option key={c} value={slugify(c)}>
              {c} ({inSeries.filter((p) => p.category === c).length})
            </option>
          ))}
        </select>
        <p className="text-sm text-muted">
          {products.length ? `${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + shown.length} of ` : ''}
          {products.length.toLocaleString('en-IN')} results
        </p>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Sort by
          <select
            value={sort}
            onChange={(e) => navigate(href({ sort: e.target.value === 'relevance' ? '' : e.target.value }))}
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

      <div className="space-y-4">
        <ProductGrid products={shown} brand={brand} onQuote={onQuote} compareIds={compareIds} onToggleCompare={onToggleCompare} />
        <Pagination page={page} totalPages={totalPages} hrefFor={(n) => href({ page: n === 1 ? '' : n })} />
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Prices shown are {brand.name} rates before GST.{' '}
        <a href="/brands" className="font-semibold text-primary hover:underline">
          Compare other brands
        </a>
      </p>
    </main>
  );
}

