/** Page copy. Edit wording here — components only render it. */
import { COMPANY } from './catalog';

export const NAV_LINKS = [
  { href: '#products', label: 'Products' },
  { href: '#brands', label: 'Brands' },
  { href: '#categories', label: 'Categories' },
  { href: '#instagram', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

export const HERO = {
  eyebrow: `Trusted in ${COMPANY.area} since ${COMPANY.established}`,
  title: 'Hardware & Interiors for a',
  highlight: 'Beautiful Home',
  subtitle:
    'Door hardware, furniture fittings and interior products from trusted brands. Compare brand-wise prices and get an instant quote.',
};

export const FEATURES = [
  { icon: 'award', title: `Since ${COMPANY.established}`, text: 'Over five decades of trust' },
  { icon: 'shield', title: 'Genuine Brands', text: 'Premium to economy, all original' },
  { icon: 'file', title: 'Brand-wise Quotes', text: 'Separate quote for every brand' },
  { icon: 'clock', title: 'Open 7 Days', text: COMPANY.workingDays },
];

export const SECTIONS = {
  brands: { title: 'Top Brands', subtitle: 'Compare prices across the brands we deal in' },
  products: { title: 'Our Products', subtitle: 'Choose a product and get a quote by brand' },
  categories: { title: 'Shop by Category' },
  interiors: {
    title: 'Interior Products',
    text: 'We also deal in the latest interior products. Ask us for designs, sizes and prices.',
  },
};

export const CTA = {
  title: 'Not sure which brand to choose?',
  text: 'Talk to us — we help builders, carpenters and homeowners pick the right hardware for every budget.',
};
