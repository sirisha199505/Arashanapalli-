// Pure functions that derive quotes from the raw quote items.
// State only stores { productId, brandId, quantity } — everything else is derived, never duplicated.
import { COMPANY } from '../data/catalog';
import { getBrand, getProduct, getUnitPrice } from './catalog';

export const itemKey = (productId, brandId) => `${productId}__${brandId}`;

export const toLine = ({ productId, brandId, quantity }) => {
  const product = getProduct(productId);
  const brand = getBrand(brandId);
  const unitPrice = getUnitPrice(product, brand);
  return { key: itemKey(productId, brandId), product, brand, quantity, unitPrice, amount: unitPrice * quantity };
};

export const calcTotals = (lines, gstRate = COMPANY.gstRate) => {
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const gst = Math.round(subtotal * gstRate);
  return { subtotal, gst, total: subtotal + gst };
};

/** One quote per brand: [{ brand, lines, totals }] */
export const groupQuotesByBrand = (items) => {
  const groups = items.map(toLine).reduce((acc, line) => {
    (acc[line.brand.id] ??= { brand: line.brand, lines: [] }).lines.push(line);
    return acc;
  }, {});
  return Object.values(groups).map((group) => ({ ...group, totals: calcTotals(group.lines) }));
};

export const quoteNumber = (brandId, date = new Date()) =>
  `AT-${brandId.slice(0, 3).toUpperCase()}-${date.toISOString().slice(0, 10).replaceAll('-', '')}`;
