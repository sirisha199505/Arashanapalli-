/** Page copy. Edit wording here — components only render it. */
import { CATEGORIES, COMPANY, PRODUCTS } from './catalog';
import { getCategories, getProduct } from '../utils/catalog';
import { postImage } from '../utils/stories';

export const NAV_LINKS = [
  { href: '#collections', label: 'Products' },
  { href: '#applications', label: 'Applications' },
  { href: '#about', label: 'About Us' },
  { href: '#instagram', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

export const HERO = {
  eyebrow: 'Premium hardware solutions',
  lines: ['Details', 'Build'],
  highlight: 'Beautiful Homes.',
  subtitle: `Door hardware, furniture fittings and interior products for homes, offices and builders. Trusted in ${COMPANY.area} since ${COMPANY.established}.`,
};

/** Category cards. `category` filters the product list. */
export const COLLECTIONS = {
  title: 'Explore Our Product Range',
  text: 'Plywood, laminates, panels, door hardware, kitchen and furniture fittings — a complete interior range for every space.',
  items: [
    { title: 'Door Handles', text: 'Mortise, lever & pull handles', image: postImage('DdVqVaYgZBE'), category: CATEGORIES.DOOR },
    { title: 'Hinges & Bolts', text: 'Hinges, tower bolts, aldrops', image: postImage('DdDgHyOBnGG'), category: CATEGORIES.DOOR },
    { title: 'Furniture Fittings', text: 'Keyboard trays, channels, CPU trolleys', image: getProduct('cpu-trolley').image, category: CATEGORIES.FURNITURE, contain: true },
    { title: 'Safety Lockers', text: 'Home & office lockers, safes', image: postImage('Deqmg8-hREq'), category: CATEGORIES.LOCKERS },
    { title: 'Wall Panels', text: '3D, acrylic, fluted & louvers', image: postImage('Dc5a_wSBpk1'), category: CATEGORIES.WALL_PANELS },
    { title: 'Plywood & Laminates', text: 'Plywood, boards, laminates, veneers', image: postImage('Dc_KaJph_xP'), category: CATEGORIES.PLYWOOD },
  ],
};

/** Small list on the hero image — derived from the collections. */
export const HERO_SIDE = {
  title: ['Hardware that', 'moves modern', 'spaces'],
  items: COLLECTIONS.items.map((c) => c.title),
};

/** Applications gallery: one large feature panel + image cards. */
export const SPACES = {
  eyebrow: 'Applications',
  title: 'Designed for Every Space',
  image: postImage('Dc5a_wSBpk1'),
  items: [
    { title: 'Homes & Villas', text: 'Doors, handles & locks', image: postImage('DdIwITnBpmt') },
    { title: 'Interior Projects', text: 'Panels, laminates & veneers', image: postImage('Dc_KaJph_xP') },
    { title: 'Builders & Carpenters', text: 'Bulk supply, any brand', image: postImage('DeWqMdvBZt9') },
    { title: 'Visit Our Showroom', text: `See it all in ${COMPANY.area}`, image: postImage('DehJ6YQhadg') },
  ],
};

export const WHY_US = {
  items: [
    { icon: 'diamond', title: 'Quality Products', text: 'Genuine, durable hardware from trusted brands.' },
    { icon: 'box', title: 'Wide Product Range', text: 'Door, furniture and interior fittings in one place.' },
    { icon: 'file', title: 'One Combined Quote', text: 'Mix brands across door & furniture fittings in a single quote.' },
    { icon: 'headset', title: 'Customer Support', text: 'Help with bulk orders and special enquiries.' },
  ],
};

export const ABOUT = {
  eyebrow: `About ${COMPANY.name}`,
  title: `Your Hardware Partner Since ${COMPANY.established}`,
  text: `${COMPANY.name} has served ${COMPANY.area} for over five decades with door hardware, furniture fittings and interior products. We help homeowners, carpenters and builders choose the right brand for every budget — with honest advice and instant combined quotes.`,
  image: postImage('DcnO71Ghu0f'),
  points: [
    { icon: 'layers', text: 'Wide product range' },
    { icon: 'tag', text: 'Multiple brands to compare' },
    { icon: 'file', text: 'Instant combined quotes' },
    { icon: 'pin', text: `Store in ${COMPANY.area}` },
    { icon: 'chat', text: 'Dedicated support on WhatsApp' },
  ],
};

export const SECTIONS = {
  products: { eyebrow: 'Shop', title: 'Our Products', subtitle: 'Choose a product and get a quote by brand' },
  brands: { eyebrow: 'Trusted brands we stock' },
  instagram: { eyebrow: 'Follow our work', title: 'From Our Instagram' },
  faq: { eyebrow: 'Good to know', title: 'Frequently Asked Questions' },
};

/** FAQs carried over from our Tradeindia listing. */
export const FAQS = [
  { q: `What is the year of establishment of ${COMPANY.name}?`, a: `${COMPANY.name} was established in ${COMPANY.established}.` },
  { q: `Who is the Proprietor of ${COMPANY.name}?`, a: `Mr. Amarender is the Proprietor of ${COMPANY.name}.` },
  { q: `What is the business location of ${COMPANY.name}?`, a: `${COMPANY.name} operates from ${COMPANY.area}, Telangana, India.` },
  {
    q: 'How many different products are listed for this company?',
    a: `${PRODUCTS.length} products are listed across ${getCategories().length} categories — from plywood, laminates and wall panels to door hardware, kitchen and furniture fittings.`,
  },
];

/** Full-page combined quote. `icons` maps a category to its section icon (others use `defaultIcon`). */
export const QUOTE_PAGE = {
  title: 'Get a Quote',
  steps: ['Your quote', 'Details & send'],
};

export const COMPARE_PAGE = {
  eyebrow: 'Compare Brands',
  title: 'Compare Products by Brand',
  subtitle: 'Pick products, then compare up to 3 brands side by side.',
};

export const CTA = {
  title: 'Not sure which brand to choose?',
  text: 'Talk to us — we help builders, carpenters and homeowners pick the right hardware for every budget.',
};
