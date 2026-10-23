// Pure lookup helpers over the catalog (the single source of truth).
import { BRANDS, COMPANY, COMPANY_FACTS, INTERIOR_LINES, PRODUCTS } from '../data/catalog';

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

export const getCategories = () => [...new Set(PRODUCTS.map((p) => p.category))];

export const filterProducts = (products, { category, search }) => {
  const term = search.trim().toLowerCase();
  return products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!term || `${p.name} ${p.category}`.toLowerCase().includes(term)),
  );
};

/** Headline numbers for the hero — derived from the data, never typed in. */
export const getStats = (now = new Date()) => [
  { key: 'years', value: `${now.getFullYear() - COMPANY.established}+`, label: 'Years of trust' },
  { key: 'lines', value: `${PRODUCTS.length + INTERIOR_LINES.length}+`, label: 'Product lines' },
  { key: 'brands', value: BRANDS.length, label: 'Brands to compare' },
];

/** Pick company facts by key, in the order given. */
export const getFacts = (...keys) => keys.map((key) => FACT_MAP[key]);
