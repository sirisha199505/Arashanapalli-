// Pure functions that derive the quote from the raw quote items.
// State only stores { productId, brandId, quantity } — everything else is derived, never duplicated.
import { CATEGORIES, COMPANY } from '../data/catalog';
import { getBrand, getProduct, getUnitPrice } from './catalog';

export const itemKey = (productId, brandId) => `${productId}__${brandId}`;

export const toLine = ({ productId, brandId, quantity }) => {
  const product = getProduct(productId);
  const brand = getBrand(brandId);
  const unitPrice = getUnitPrice(product, brand);
  return { key: itemKey(productId, brandId), product, brand, quantity, unitPrice, amount: unitPrice * quantity };
};

const sumAmounts = (lines) => lines.reduce((sum, line) => sum + line.amount, 0);

export const calcTotals = (lines, gstRate = COMPANY.gstRate) => {
  const subtotal = sumAmounts(lines);
  const gst = Math.round(subtotal * gstRate);
  return { subtotal, gst, total: subtotal + gst };
};

/** One combined quote, split into a section per category (every category is always present, even if empty). */
export const buildQuote = (items) => {
  const lines = items.map(toLine);
  const sections = Object.values(CATEGORIES).map((category) => {
    const sectionLines = lines.filter((l) => l.product.category === category);
    return { category, lines: sectionLines, subtotal: sumAmounts(sectionLines) };
  });
  return { lines, sections, totals: calcTotals(lines) };
};

export const quoteNumber = (date = new Date()) => `AT-${date.toISOString().slice(0, 10).replaceAll('-', '')}`;
