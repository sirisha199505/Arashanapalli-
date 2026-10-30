// Pure lookup helpers over the catalog (the single source of truth).
import { BRANDS, CATEGORY_ICONS, CATEGORY_ORDER, COMPANY, COMPANY_FACTS, PRODUCTS } from '../data/catalog';

const byId = (list) => Object.fromEntries(list.map((item) => [item.id, item]));

const BRAND_MAP = byId(BRANDS);
const PRODUCT_MAP = byId(PRODUCTS);
const FACT_MAP = byId(COMPANY_FACTS.map((f) => ({ ...f, id: f.key })));

export const getBrand = (id) => BRAND_MAP[id];
export const getProduct = (id) => PRODUCT_MAP[id];

/** Brand name without the bracketed note, e.g. 'Arashanapalli (House Brand)' → 'Arashanapalli'. */
export const shortBrandName = (brand) => brand.name.split(' (')[0];

export const getBrandsForProduct = (product) => product.brandIds.map(getBrand);

export const getUnitPrice = (product, brand) => Math.round(product.basePrice * brand.priceFactor);

/** Lowest price across the brands a product is available in. */
export const getStartingPrice = (product) => Math.min(...getBrandsForProduct(product).map((b) => getUnitPrice(product, b)));

// categories that have products, in CATEGORY_ORDER; any category missing from that order goes last
const USED = new Set(PRODUCTS.map((p) => p.category));
const CATEGORY_LIST = [...new Set([...CATEGORY_ORDER, ...USED])].filter((c) => USED.has(c));
export const getCategories = () => CATEGORY_LIST;

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] ?? 'box';

// Lowercased text each product is searched against — built once so search stays fast on large catalogs.
const buildSearchText = (p) => [p.name, p.category, p.description, ...getBrandsForProduct(p).map((b) => b.name)].join(' ').toLowerCase();
const SEARCH_TEXT = Object.fromEntries(PRODUCTS.map((p) => [p.id, buildSearchText(p)]));
const STARTING_PRICE = Object.fromEntries(PRODUCTS.map((p) => [p.id, getStartingPrice(p)]));
const searchText = (p) => SEARCH_TEXT[p.id] ?? buildSearchText(p);
const startingPrice = (p) => STARTING_PRICE[p.id] ?? getStartingPrice(p);

const searchTerms = (search) => search.trim().toLowerCase().split(/\s+/).filter(Boolean);

/** Every word typed must appear somewhere in the product's name, category, description or brands. */
const matchesTerms = (product, terms) => terms.every((t) => searchText(product).includes(t));

export const filterProducts = (products, { category, search }) => {
  const terms = searchTerms(search);
  return products.filter((p) => (!category || p.category === category) && matchesTerms(p, terms));
};

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

/** 'Featured' keeps catalog order, but while searching puts products whose name matches every word first. */
const sortProducts = (products, sort, terms) => {
  if (SORTERS[sort]) return [...products].sort(SORTERS[sort]);
  if (!terms.length) return products;
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
  const matched = products.filter((p) => matchesTerms(p, terms));
  const inCategory = category ? matched.filter((p) => p.category === category) : matched;
  const results = brandIds.length ? inCategory.filter((p) => p.brandIds.some((id) => brandIds.includes(id))) : inCategory;
  return {
    results: sortProducts(results, sort, terms),
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
