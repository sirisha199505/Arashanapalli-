// Pure functions behind the brand comparison: which brands can be compared and how they line up.
import { BRANDS } from '../data/catalog';
import { getProduct, getUnitPrice } from './catalog';

export const MAX_COMPARE_BRANDS = 3;

/** Brands that carry at least one of the products, in catalog order. */
export const getCompareBrands = (products) => BRANDS.filter((b) => products.some((p) => p.brandIds.includes(b.id)));

/**
 * One column per brand: { brand, prices: { [productId]: unitPrice | null }, total, available }.
 * `cheapest[productId]` is the lowest price across the compared brands for that product.
 */
export const buildComparison = (productIds, brands) => {
  const products = productIds.map(getProduct);
  const columns = brands.map((brand) => {
    const prices = Object.fromEntries(
      products.map((p) => [p.id, p.brandIds.includes(brand.id) ? getUnitPrice(p, brand) : null]),
    );
    const available = Object.values(prices).filter((price) => price !== null);
    return { brand, prices, total: available.reduce((sum, price) => sum + price, 0), available: available.length };
  });
  const cheapest = Object.fromEntries(
    products.map((p) => {
      const prices = columns.map((c) => c.prices[p.id]).filter((price) => price !== null);
      return [p.id, prices.length ? Math.min(...prices) : null];
    }),
  );
  return { products, columns, cheapest };
};
