// Pure functions that derive the quote from the raw quote state.
// State only stores { brandId, items: [{ productId, quantity, brandId? }] } — everything else is derived, never duplicated.
// An item's own brandId overrides the quote's brandId, so different products can be quoted in different brands.
import { BRANDS, COMPANY } from '../data/catalog';
import { getBrand, getCategories, getProduct, getUnitPrice } from './catalog';

/** One quote line priced in `brand`. `available` is false when the brand doesn't make that product. */
const toLine = ({ productId, quantity }, brand) => {
  const product = getProduct(productId);
  const available = Boolean(brand) && product.brandIds.includes(brand.id);
  const unitPrice = available ? getUnitPrice(product, brand) : null;
  return { key: productId, product, brand, quantity, available, unitPrice, amount: available ? unitPrice * quantity : null };
};

const sumAmounts = (lines) => lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);

export const calcTotals = (lines, gstRate = COMPANY.gstRate) => {
  const subtotal = sumAmounts(lines);
  const gst = Math.round(subtotal * gstRate);
  return { subtotal, gst, total: subtotal + gst };
};

/**
 * What the current items would cost in every brand, so the customer can pick the budget-friendly one.
 * `budget` marks the lowest subtotal among the brands that carry the most of the items.
 */
export const getBrandOptions = (items) => {
  const options = BRANDS.map((brand) => {
    const lines = items.map((item) => toLine(item, brand));
    const priced = lines.filter((l) => l.available);
    return { brand, subtotal: sumAmounts(priced), available: priced.length, missing: lines.length - priced.length };
  });
  const most = Math.max(0, ...options.map((o) => o.available));
  const lowest = most ? Math.min(...options.filter((o) => o.available === most).map((o) => o.subtotal)) : null;
  // once there are items, only brands that make at least one of them are worth listing
  return options
    .filter((o) => !items.length || o.available > 0)
    .map((o) => ({ ...o, budget: lowest !== null && o.available === most && o.subtotal === lowest }));
};

/**
 * The quote, each line in its own brand (or the quote's brand), split into a section per category that has items.
 * `brand` is the one brand every line uses, or null when lines differ (`brands` lists them) or none is chosen yet.
 */
export const buildQuote = ({ brandId, items }) => {
  const lines = items.map((item) => {
    const id = item.brandId ?? brandId;
    return toLine(item, id ? getBrand(id) : null);
  });
  const brands = [...new Map(lines.filter((l) => l.brand).map((l) => [l.brand.id, l.brand])).values()];
  const allBranded = lines.length > 0 && lines.every((l) => l.brand);
  const brand = allBranded && brands.length === 1 ? brands[0] : null;
  const used = new Set(lines.map((l) => l.product.category));
  const sections = getCategories()
    .filter((c) => used.has(c))
    .map((category) => {
      const sectionLines = lines.filter((l) => l.product.category === category);
      return { category, lines: sectionLines, subtotal: sumAmounts(sectionLines) };
    });
  return {
    brand,
    brands,
    allBranded,
    lines,
    sections,
    unavailable: lines.filter((l) => l.brand && !l.available),
    totals: calcTotals(lines),
    brandOptions: getBrandOptions(items),
  };
};

export const quoteNumber = (date = new Date()) => `AT-${date.toISOString().slice(0, 10).replaceAll('-', '')}`;
