/** Page copy. Edit wording here — components only render it. */
import { CATEGORIES, COMPANY, INTERIOR_LINES } from './catalog';
import { getProduct } from '../utils/catalog';
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

/** Category cards. `category` filters the product list; `enquire` opens WhatsApp. */
export const COLLECTIONS = {
  title: 'Explore Our Product Range',
  text: 'A complete range of door hardware, furniture fittings and interior products for every space.',
  items: [
    { title: 'Door Handles', text: 'Mortise, lever & pull handles', image: postImage('DdVqVaYgZBE'), category: CATEGORIES.DOOR },
    { title: 'Hinges & Bolts', text: 'Hinges, tower bolts, aldrops', image: postImage('DdDgHyOBnGG'), category: CATEGORIES.DOOR },
    { title: 'Furniture Fittings', text: 'Keyboard trays, channels, CPU trolleys', image: getProduct('cpu-trolley').image, category: CATEGORIES.FURNITURE, contain: true },
    { title: 'Safety Lockers', text: 'Godrej home & office lockers', image: postImage('Deqmg8-hREq'), enquire: 'Safety Lockers' },
    { title: 'Wall Panels', text: '3D, acrylic & decorative panels', image: postImage('Dc5a_wSBpk1'), enquire: 'Wall Panels' },
    { title: 'Plywood & Laminates', text: INTERIOR_LINES.filter((l) => !['Wall Panels', 'Safety Lockers'].includes(l)).join(', '), image: postImage('Dc_KaJph_xP'), enquire: 'Plywood, Laminates & Veneers' },
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
    { title: 'Homes & Villas', text: 'Doors, handles, hinges & locks', image: postImage('DdIwITnBpmt') },
    { title: 'Interior Projects', text: 'Panels, laminates & veneers', image: postImage('Dc_KaJph_xP') },
    { title: 'Builders & Carpenters', text: 'Bulk supply with brand choice', image: postImage('DeWqMdvBZt9') },
    { title: 'Visit Our Showroom', text: `See it all in ${COMPANY.area}`, image: postImage('DehJ6YQhadg') },
  ],
};

export const WHY_US = {
  items: [
    { icon: 'diamond', title: 'Quality Products', text: 'Genuine, durable hardware from trusted brands.' },
    { icon: 'box', title: 'Wide Product Range', text: 'Door, furniture and interior fittings in one place.' },
    { icon: 'file', title: 'Brand-wise Quotes', text: 'Compare brands with a separate quote for each.' },
    { icon: 'headset', title: 'Customer Support', text: 'Help with bulk orders and special enquiries.' },
  ],
};

export const ABOUT = {
  eyebrow: `About ${COMPANY.name}`,
  title: `Your Hardware Partner Since ${COMPANY.established}`,
  text: `${COMPANY.name} has served ${COMPANY.area} for over five decades with door hardware, furniture fittings and interior products. We help homeowners, carpenters and builders choose the right brand for every budget — with honest advice and brand-wise quotes.`,
  image: postImage('DcnO71Ghu0f'),
  points: [
    { icon: 'layers', text: 'Wide product range' },
    { icon: 'tag', text: 'Multiple brands to compare' },
    { icon: 'file', text: 'Instant brand-wise quotes' },
    { icon: 'pin', text: `Store in ${COMPANY.area}` },
    { icon: 'chat', text: 'Dedicated support on WhatsApp' },
  ],
};

export const SECTIONS = {
  products: { eyebrow: 'Shop', title: 'Our Products', subtitle: 'Choose a product and get a quote by brand' },
  brands: { eyebrow: 'Trusted brands we stock' },
  instagram: { eyebrow: 'Follow our work', title: 'From Our Instagram' },
};

export const CTA = {
  title: 'Not sure which brand to choose?',
  text: 'Talk to us — we help builders, carpenters and homeowners pick the right hardware for every budget.',
};
