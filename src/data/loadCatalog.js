// Replaces the bundled categories/brands/products with the live ones from the backend, before the app renders.
// The arrays are filled in place, so every module that imported them sees the live data.
//
// Speed: the backend can be slow, and asleep on a free plan (30–60 s to wake), so the site never waits long for it:
//  - each live catalog is saved in the browser; on the next visit that copy opens the site at once if the live one
//    isn't back within ~1 s, while the live one keeps loading in the background and is saved for the visit after;
//  - on a first visit (nothing saved) it waits up to 8 s, then uses the bundled catalog.
// The admin passes { live: true } and always waits for the live catalog.
import { BRANDS, CATEGORY_ICONS, CATEGORY_ORDER, PACKAGES, PRODUCTS } from './catalog';
import { fetchCatalog } from '../utils/api';

const CACHE_KEY = 'at-catalog-v1';
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // a copy older than a month is ignored
const WAIT_WITH_COPY = 1200;
const WAIT_WITHOUT_COPY = 8000;

const replace = (list, items) => list.splice(0, list.length, ...items);
const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(null), ms));

// storage can be full, blocked or missing (private browsing): the site then simply works without the copy
const readCopy = () => {
  try {
    const copy = JSON.parse(localStorage.getItem(CACHE_KEY));
    return copy?.data?.products?.length && Date.now() - copy.savedAt < CACHE_MAX_AGE ? copy.data : null;
  } catch {
    return null;
  }
};
const saveCopy = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    /* no room or no storage: nothing to do */
  }
};

/** Drops this browser's saved copy, so the next visit waits for the live catalog (used after a change in the admin). */
export const forgetSavedCatalog = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* no storage: nothing saved */
  }
};

/** Puts a catalog in place of the bundled one; false if it's empty. */
const apply = (data) => {
  const { categories, brands, products, packages } = data ?? {};
  if (!brands?.length || !products?.length) return false;
  replace(BRANDS, brands);
  replace(PRODUCTS, products);
  replace(PACKAGES, packages ?? []);
  if (categories?.length) {
    replace(CATEGORY_ORDER, categories.map((c) => c.name));
    categories.forEach((c) => (CATEGORY_ICONS[c.name] = c.icon));
  }
  return true;
};

export async function loadCatalog({ live = false } = {}) {
  // one request, given a minute so a sleeping server can wake; whenever it arrives it's saved for the next visit
  const request = fetchCatalog({ timeout: 60_000 })
    .then((data) => {
      if (data?.products?.length) saveCopy(data);
      return data;
    })
    .catch((err) => {
      console.warn('Catalog API unavailable.', err);
      return null;
    });

  if (live) {
    if (!apply(await request)) console.warn('Using the bundled catalog.');
    return;
  }
  const copy = readCopy();
  const fresh = await Promise.race([request, wait(copy ? WAIT_WITH_COPY : WAIT_WITHOUT_COPY)]);
  if (apply(fresh)) return;
  if (copy && apply(copy)) return;
  console.warn('Using the bundled catalog.');
}
