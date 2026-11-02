// Pure lookup helpers over the catalog (the single source of truth).
import { BRANDS, BRAND_TIERS, CATEGORY_ICONS, CATEGORY_ORDER, COMPANY, COMPANY_FACTS, PRODUCTS } from '../data/catalog';

const byId = (list) => Object.fromEntries(list.map((item) => [item.id, item]));

const BRAND_MAP = byId(BRANDS);
const PRODUCT_MAP = byId(PRODUCTS);
const FACT_MAP = byId(COMPANY_FACTS.map((f) => ({ ...f, id: f.key })));

export const getBrand = (id) => BRAND_MAP[id];
export const getProduct = (id) => PRODUCT_MAP[id];

/** What the sales team types → stored code: '1001', 'at-1001', 'AT 1001' → 'AT1001' (same rule as the backend). */
export const normalizeCode = (input) => {
  const code = String(input).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^\d+$/.test(code) ? `AT${code}` : code;
};
const CODE_MAP = Object.fromEntries(PRODUCTS.filter((p) => p.code).map((p) => [p.code, p]));
/** The product with this shelf code, or undefined. */
export const getProductByCode = (input) => (String(input).trim() ? CODE_MAP[normalizeCode(input)] : undefined);

const BRAND_CODE_MAP = Object.fromEntries(BRANDS.filter((b) => b.code).map((b) => [b.code, b]));
/** The brand with this short code ('HET', 'het'), or undefined. */
export const getBrandByCode = (input) => BRAND_CODE_MAP[String(input).toUpperCase().replace(/[^A-Z0-9]/g, '')];

/** A product's code in one brand — AT1002 in Hettich is AT1002-HET. Without a brand, just the product code. */
export const dynamicCode = (product, brand) => (product.code && brand?.code ? `${product.code}-${brand.code}` : product.code);

/**
 * What a typed code points to: { product } for a shelf code, { product, brand } for a dynamic code
 * ('AT1002-HET', 'at1002het', '1002 het'), {} for anything else. The brand must make the product.
 */
export const parseCode = (input) => {
  const raw = String(input).trim().toUpperCase();
  if (!raw) return {};
  const product = getProductByCode(raw);
  if (product) return { product };
  const withBrand = (p, b) => (p && b && p.brandIds.includes(b.id) ? { product: p, brand: b } : {});
  const dash = raw.lastIndexOf('-');
  if (dash > 0) {
    const found = withBrand(getProductByCode(raw.slice(0, dash)), getBrandByCode(raw.slice(dash + 1)));
    if (found.product) return found;
  }
  // no separator: AT digits, then the brand code
  const m = raw.replace(/[^A-Z0-9]/g, '').match(/^(?:AT)?(\d+)([A-Z][A-Z0-9]{1,4})$/);
  return m ? withBrand(CODE_MAP[`AT${m[1]}`], BRAND_CODE_MAP[m[2]]) : {};
};

/** Each brand has its own page at /brand/<id>, e.g. /brand/hettich. */
export const brandPath = (brand, seriesId) => `/brand/${brand.id}${seriesId ? `?series=${seriesId}` : ''}`;

/** Brands grouped by class (Premium / Standard / Economy, then any other tier). */
export const getBrandsByTier = () => {
  const tiers = [...BRAND_TIERS, ...new Set(BRANDS.map((b) => b.tier).filter((t) => t && !BRAND_TIERS.includes(t)))];
  return tiers.map((tier) => ({ tier, brands: BRANDS.filter((b) => b.tier === tier) })).filter((g) => g.brands.length);
};

/** Every product a brand makes, optionally only one of its series, in catalog order. */
export const getBrandProducts = (brand, seriesId) =>
  PRODUCTS.filter((p) => p.brandIds.includes(brand.id) && (!seriesId || (p.seriesIds ?? []).includes(Number(seriesId))));

/** The series (of this brand) a product belongs to, if any. */
export const getProductSeries = (product, brand) => brand.series?.find((s) => (product.seriesIds ?? []).includes(s.id));

/** URL-safe name: 'Boards & MDF' → 'boards-mdf'. Each category has its own page at /category/<slug>. */
export const slugify = (text) => text.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const categoryPath = (category) => `/category/${slugify(category)}`;

/** Each product has its own page at /product/<shelf code>, e.g. /product/AT1002 (the id if a product has no code). */
export const productPath = (product) => `/product/${product.code ?? product.id}`;
/** The product for the last part of a /product/… address — a shelf code or an id. */
export const getProductForPath = (key) => getProductByCode(key) ?? getProduct(decodeURIComponent(key));

/** Brand name without the bracketed note, e.g. 'Arashanapalli (House Brand)' → 'Arashanapalli'. */
export const shortBrandName = (brand) => brand.name.split(' (')[0];

export const getBrandsForProduct = (product) => product.brandIds.map(getBrand);

/** What the shop has set for one brand's version of a product (price, stock, image, description) — {} when nothing. */
export const getBrandDetails = (product, brand) => product.brandDetails?.[brand.id] ?? {};

/** The brand's own price if the shop set one, else base price × brand factor (the backend uses the same rule). */
export const getUnitPrice = (product, brand) => getBrandDetails(product, brand).price ?? Math.round(product.basePrice * brand.priceFactor);

/** Stock as shown to customers and staff; no entry = not tracked, nothing shown. */
export const STOCK = {
  in_stock: { label: 'In stock', tone: 'success' },
  low_stock: { label: 'Few left', tone: 'primary' },
  out_of_stock: { label: 'Out of stock', tone: 'neutral' },
  on_order: { label: 'On order', tone: 'neutral' },
};

/** Lowest price across the brands a product is available in. */
export const getStartingPrice = (product) => Math.min(...getBrandsForProduct(product).map((b) => getUnitPrice(product, b)));

// categories that have products, in CATEGORY_ORDER; any category missing from that order goes last
const USED = new Set(PRODUCTS.map((p) => p.category));
const CATEGORY_LIST = [...new Set([...CATEGORY_ORDER, ...USED])].filter((c) => USED.has(c));
export const getCategories = () => CATEGORY_LIST;
const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORY_LIST.map((c) => [slugify(c), c]));
/** '/category/door-hardware' → 'Door Hardware' (undefined for an unknown slug). */
export const getCategoryBySlug = (slug) => CATEGORY_BY_SLUG[slug];

const NEW_ARRIVALS = PRODUCTS.filter((p) => p.newArrival);
/** New arrivals, optionally only one category's, in catalog order. */
export const getNewArrivals = (category) => (category ? NEW_ARRIVALS.filter((p) => p.category === category) : NEW_ARRIVALS);
/** Categories that have new arrivals, in category order. */
export const getNewArrivalCategories = () => CATEGORY_LIST.filter((c) => NEW_ARRIVALS.some((p) => p.category === c));

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] ?? 'box';

// Lowercased text each product is searched against — built once so search stays fast on large catalogs.
const buildSearchText = (p) => [p.code, p.name, p.category, p.description, ...getBrandsForProduct(p).map((b) => b.name)].join(' ').toLowerCase();
const SEARCH_TEXT = Object.fromEntries(PRODUCTS.map((p) => [p.id, buildSearchText(p)]));
const STARTING_PRICE = Object.fromEntries(PRODUCTS.map((p) => [p.id, getStartingPrice(p)]));
const searchText = (p) => SEARCH_TEXT[p.id] ?? buildSearchText(p);
const startingPrice = (p) => STARTING_PRICE[p.id] ?? getStartingPrice(p);

const searchTerms = (search) => search.trim().toLowerCase().split(/\s+/).filter(Boolean);

/** Every word typed must appear somewhere in the product's name, category, description or brands. */
const matchesTerms = (product, terms) => terms.every((t) => searchText(product).includes(t));


export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Featured' },
  { id: 'priceLow', label: 'Price: Low to High' },
  { id: 'priceHigh', label: 'Price: High to Low' },
  { id: 'name', label: 'Name: A to Z' },
];

const SORTERS = {
  priceLow: (a, b) => startingPrice(a) - startingPrice(b),
  priceHigh: (a, b) => startingPrice(b) - startingPrice(a),
  name: (a, b) => a.name.localeCompare(b.name),
};

/** 'Featured' keeps catalog order, but while searching puts an exact code match first, then products whose name matches every word. */
const sortProducts = (products, sort, terms, search) => {
  if (SORTERS[sort]) return [...products].sort(SORTERS[sort]);
  if (!terms.length) return products;
  const byCode = parseCode(search).product;
  if (byCode && products.includes(byCode)) return [byCode, ...sortProducts(products.filter((p) => p !== byCode), sort, terms)];
  const nameHit = (p) => terms.every((t) => p.name.toLowerCase().includes(t));
  return [...products.filter(nameHit), ...products.filter((p) => !nameHit(p))];
};

const countBy = (products, keysOf) => {
  const counts = {};
  products.forEach((p) => keysOf(p).forEach((k) => (counts[k] = (counts[k] ?? 0) + 1)));
  return counts;
};

/** Catalog search for the quote page: results plus per-category / per-brand counts for the filter sidebar. */
export const searchCatalog = (products, { search = '', category = null, brandIds = [], sort = 'relevance' }) => {
  const terms = searchTerms(search);
  // a typed shelf code ('1001', 'at-1001') finds its product even though it isn't written that way in the text
  const byCode = parseCode(search).product;
  const matched = products.filter((p) => p === byCode || matchesTerms(p, terms));
  const inCategory = category ? matched.filter((p) => p.category === category) : matched;
  const results = brandIds.length ? inCategory.filter((p) => p.brandIds.some((id) => brandIds.includes(id))) : inCategory;
  return {
    results: sortProducts(results, sort, terms, search),
    categoryCounts: countBy(matched, (p) => [p.category]),
    brandCounts: countBy(inCategory, (p) => p.brandIds),
  };
};

/** Headline numbers for the hero — derived from the data, never typed in. */
export const getStats = (now = new Date()) => [
  { key: 'years', value: `${now.getFullYear() - COMPANY.established}+`, label: 'Years of trust' },
  { key: 'lines', value: `${PRODUCTS.length}+`, label: 'Products' },
  { key: 'brands', value: BRANDS.length, label: 'Brands to compare' },
];

/** Pick company facts by key, in the order given. */
export const getFacts = (...keys) => keys.map((key) => FACT_MAP[key]);
