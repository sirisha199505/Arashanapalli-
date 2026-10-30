// Replaces the bundled brands/products with the live ones from the backend, before the app renders.
// The arrays are filled in place, so every module that imported them sees the live data.
// If the backend is down or slow, the bundled catalog is kept and the site still works.
import { BRANDS, PRODUCTS } from './catalog';
import { fetchCatalog } from '../utils/api';

const replace = (list, items) => list.splice(0, list.length, ...items);

export async function loadCatalog() {
  try {
    const { brands, products } = await fetchCatalog();
    if (!brands?.length || !products?.length) return;
    replace(BRANDS, brands);
    replace(PRODUCTS, products);
  } catch (err) {
    console.warn('Catalog API unavailable — using the bundled catalog.', err);
  }
}
