// Runs after `vite build`: writes dist/<page>/index.html copies of the app with page-specific <title>,
// description and Open Graph tags. WhatsApp / Instagram / Facebook link previews read these tags without
// running JavaScript, so every category and product gets a proper preview when its link is shared.
// Never fails the build: if the backend can't be reached, category pages are skipped (they still work as links).
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DIST = new URL('../dist/', import.meta.url);
const NAME = 'Arashanapalli Traders';
const API = process.env.VITE_API_URL?.replace(/\/+$/, '');
const SITE = (process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ?? '').replace(/\/+$/, '');

// must match slugify() in src/utils/catalog.js
const slugify = (text) => text.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const absolute = (url) => (/^https?:/.test(url) ? url : `${SITE}${url}`);

const STATIC_PAGES = [
  { path: '/products', title: 'Products', description: 'Browse door hardware, plywood, laminates, kitchen and furniture fittings. Compare brands and get an instant quote.' },
  { path: '/new-arrivals', title: 'New Arrivals', description: 'The latest door hardware, plywood, laminates, fittings and interior products.' },
  { path: '/applications', title: 'Applications', description: 'Hardware and interior products for kitchens, wardrobes, doors and every room.' },
  { path: '/about', title: 'About Us', description: `${NAME} has served Secunderabad since 1970 with door hardware, furniture fittings and interior products.` },
  { path: '/gallery', title: 'Gallery', description: 'Our latest work and products, from our Instagram.' },
  { path: '/contact', title: 'Contact', description: `Call, WhatsApp or visit ${NAME} in General Bazar, Secunderabad.` },
];

async function fetchCatalog() {
  if (!API) return null;
  try {
    // a sleeping Render service can take ~a minute to wake up
    const res = await fetch(`${API}/api/catalog`, { signal: AbortSignal.timeout(90_000) });
    return (await res.json()).data;
  } catch (err) {
    console.warn(`prerender: catalog unavailable (${err.message}) — category previews skipped`);
    return null;
  }
}

function categoryPages(catalog) {
  if (!catalog) return [];
  const brandNames = Object.fromEntries(catalog.brands.map((b) => [b.id, b.name.split(' (')[0]]));
  return catalog.categories
    .map(({ name }) => {
      const products = catalog.products.filter((p) => p.category === name);
      if (!products.length) return null;
      const brands = [...new Set(products.flatMap((p) => p.brandIds))].slice(0, 4).map((id) => brandNames[id]);
      return {
        path: `/category/${slugify(name)}`,
        title: name,
        description: `${name} at ${NAME}, Secunderabad — ${products.length} products from brands like ${brands.join(', ')}. Compare brands and get an instant quote.`,
        image: products.find((p) => p.image)?.image,
      };
    })
    .filter(Boolean);
}

function brandPages(catalog) {
  if (!catalog) return [];
  return [
    { path: '/brands', title: 'Brands', description: 'Hettich, Godrej, Hafele, Greenply, Century and more — compare brands by class and browse their products and series.' },
    ...catalog.brands.map((b) => {
      const products = catalog.products.filter((p) => p.brandIds.includes(b.id));
      return {
        path: `/brand/${b.id}`,
        title: `${b.name} products`,
        description: `${b.name} (${b.tier}) at ${NAME}, Secunderabad — ${products.length} products${b.series?.length ? ` in ${b.series.length} series` : ''}. See prices and get an instant quote.`,
        image: products.find((p) => p.image)?.image,
      };
    }),
  ];
}

function productPages(catalog) {
  if (!catalog) return [];
  const brandCount = (p) => p.brandIds.length;
  return catalog.products
    .filter((p) => p.code)
    .map((p) => ({
      path: `/product/${p.code}`,
      title: `${p.name} (${p.code})`,
      description: `${p.name} — ${p.category} from ${brandCount(p)} brand${brandCount(p) === 1 ? '' : 's'} at ${NAME}, Secunderabad. ${p.description ?? ''}`.trim(),
      image: p.image ?? undefined,
    }));
}

function render(template, { path, title, description, image = '/logo.jpg' }) {
  const fullTitle = `${title} | ${NAME}`;
  const url = `${SITE}${path}`;
  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:title" content="${escape(fullTitle)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:image" content="${escape(absolute(image))}" />`,
    SITE && `<meta property="og:url" content="${escape(url)}" />`,
    SITE && `<link rel="canonical" href="${escape(url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].filter(Boolean);
  return template
    .replace(/<title>.*?<\/title>\s*/s, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', () => `    ${tags.join('\n    ')}\n  </head>`); // a function, so '$' in text is never a pattern
}

try {
  const template = await readFile(new URL('index.html', DIST), 'utf8');
  const catalog = await fetchCatalog();
  const pages = [...STATIC_PAGES, ...categoryPages(catalog), ...brandPages(catalog), ...productPages(catalog)];
  for (const page of pages) {
    const dir = new URL(`.${page.path}/`, DIST);
    await mkdir(dir, { recursive: true });
    await writeFile(new URL('index.html', dir), render(template, page));
  }
  console.log(`prerender: wrote ${pages.length} pages${SITE ? '' : ' (set SITE_URL for absolute preview links)'}`);
} catch (err) {
  console.warn(`prerender: skipped (${err.message})`);
}
