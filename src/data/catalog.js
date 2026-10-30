/**
 * SINGLE SOURCE OF TRUTH for all static business data.
 * Every component reads company / brand / product info from here — nothing is hard-coded in the UI.
 *
 * Products & images: the first 10 products are from https://www.tradeindia.com/arashanapalli-traders-265860/
 *                    the rest are MOCK products from ./mockProducts.js (a full interior-traders range for testing).
 * Brands & prices: SAMPLE values — the TradeIndia page lists no brands or prices.
 *                  Replace them with your real brands and rates (later this file can be swapped for an API).
 */
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from './mockProducts';

export const COMPANY = {
  name: 'Arashanapalli Traders',
  tagline: 'Hardware | Interior Products',
  about:
    'We deal in all kinds of latest interior products to make your home beautiful — door hardware, furniture fittings, plywood, laminates, veneers & more. Serving Secunderabad since 1970.',
  owner: 'Mr. Amarender (Proprietor)',
  address: 'Door No: 3-2-115, General Bazar, Near Anjali Cinema, Secunderabad, Telangana 500003, India',
  area: 'Secunderabad',
  established: 1970,
  businessType: 'Manufacturer, Supplier',
  workingDays: 'Monday – Sunday',
  phone: '+91 98851 65727',
  email: 'sales@example.com', // TODO: real email
  googleListing: 'https://g.co/kgs/FhSd9q2',
  gstRate: 0.18,
};

/** Labelled company facts — Hero, Footer and Seller Profile all pick from this list. */
export const COMPANY_FACTS = [
  { key: 'owner', label: 'Contact Person', value: COMPANY.owner },
  { key: 'businessType', label: 'Business Type', value: COMPANY.businessType },
  { key: 'established', label: 'Established', value: COMPANY.established },
  { key: 'employees', label: 'No. of Employees', value: 10 },
  { key: 'turnover', label: 'Annual Turnover', value: 'Rs 25 Lakhs' },
  { key: 'workingDays', label: 'Working Days', value: COMPANY.workingDays },
  { key: 'phone', label: 'Phone', value: COMPANY.phone },
  { key: 'email', label: 'Email', value: COMPANY.email },
  { key: 'address', label: 'Address', value: COMPANY.address },
];

/** Customer reviews — add real ones here (none are listed yet). */
export const REVIEWS = [];

/** Every category, in the order shown across the site. */
export const CATEGORIES = {
  PLYWOOD: MOCK_CATEGORIES.PLYWOOD,
  BOARDS: MOCK_CATEGORIES.BOARDS,
  LAMINATES: MOCK_CATEGORIES.LAMINATES,
  VENEERS: MOCK_CATEGORIES.VENEERS,
  WALL_PANELS: MOCK_CATEGORIES.WALL_PANELS,
  DOOR: 'Door Hardware',
  LOCKS: MOCK_CATEGORIES.LOCKS,
  FURNITURE: 'Furniture Accessories',
  KITCHEN: MOCK_CATEGORIES.KITCHEN,
  WARDROBE: MOCK_CATEGORIES.WARDROBE,
  GLASS: MOCK_CATEGORIES.GLASS,
  LOCKERS: MOCK_CATEGORIES.LOCKERS,
  ADHESIVES: MOCK_CATEGORIES.ADHESIVES,
  EDGE_BANDING: MOCK_CATEGORIES.EDGE_BANDING,
  FASTENERS: MOCK_CATEGORIES.FASTENERS,
  DOORS: MOCK_CATEGORIES.DOORS,
  FLOORING: MOCK_CATEGORIES.FLOORING,
  LIGHTING: MOCK_CATEGORIES.LIGHTING,
};

/** Category display order. Replaced in place by the live order from the backend (see loadCatalog.js). */
export const CATEGORY_ORDER = Object.values(CATEGORIES);

/** Icon (from components/ui/Icon) for each category — used on quote sections and when a product has no photo. */
export const CATEGORY_ICONS = {
  [CATEGORIES.PLYWOOD]: 'layers',
  [CATEGORIES.BOARDS]: 'layers',
  [CATEGORIES.LAMINATES]: 'grid',
  [CATEGORIES.VENEERS]: 'layers',
  [CATEGORIES.WALL_PANELS]: 'grid',
  [CATEGORIES.DOOR]: 'door',
  [CATEGORIES.LOCKS]: 'shield',
  [CATEGORIES.FURNITURE]: 'monitor',
  [CATEGORIES.KITCHEN]: 'box',
  [CATEGORIES.WARDROBE]: 'box',
  [CATEGORIES.GLASS]: 'diamond',
  [CATEGORIES.LOCKERS]: 'shield',
  [CATEGORIES.ADHESIVES]: 'tag',
  [CATEGORIES.EDGE_BANDING]: 'tag',
  [CATEGORIES.FASTENERS]: 'tag',
  [CATEGORIES.DOORS]: 'door',
  [CATEGORIES.FLOORING]: 'grid',
  [CATEGORIES.LIGHTING]: 'bulb',
};


/** Brands. `priceFactor` scales a product's base price to give a per-brand rate. `specs` are SAMPLE values — replace with real ones. */
export const BRANDS = [
  {
    id: 'godrej',
    name: 'Godrej',
    tier: 'Premium',
    priceFactor: 1.35,
    specs: { material: 'Stainless steel / brass', finish: 'Satin, antique, gold', warranty: '5 years', certification: 'ISI marked', origin: 'India' },
  },
  {
    id: 'hettich',
    name: 'Hettich',
    tier: 'Premium',
    priceFactor: 1.5,
    specs: { material: 'Steel, zinc die-cast', finish: 'Nickel, matt black', warranty: '10 years', certification: 'ISO 9001, LGA tested', origin: 'Germany' },
  },
  {
    id: 'dorset',
    name: 'Dorset',
    tier: 'Standard',
    priceFactor: 1.15,
    specs: { material: 'Stainless steel / zinc', finish: 'Satin, rose gold', warranty: '3 years', certification: 'ISI marked', origin: 'India' },
  },
  {
    id: 'ebco',
    name: 'Ebco',
    tier: 'Standard',
    priceFactor: 1.1,
    specs: { material: 'Cold-rolled steel', finish: 'Zinc, black powder coat', warranty: '2 years', certification: 'ISO 9001', origin: 'India' },
  },
  {
    id: 'local',
    name: 'Arashanapalli (House Brand)',
    tier: 'Economy',
    priceFactor: 1,
    specs: { material: 'Aluminium / M.S.', finish: 'Silver, black', warranty: '1 year', certification: 'ISI (selected items)', origin: 'India' },
  },
  // ---- interior brands (MOCK specs and price factors) ----
  { id: 'greenply', name: 'Greenply', tier: 'Premium', priceFactor: 1.4, specs: { material: 'Hardwood plywood, veneers', finish: 'Natural, pre-laminated', warranty: 'Up to 30 years', certification: 'ISI, E0 emission', origin: 'India' } },
  { id: 'century', name: 'Century Ply', tier: 'Premium', priceFactor: 1.38, specs: { material: 'Plywood, laminates, boards', finish: 'Natural, laminated', warranty: 'Up to 25 years', certification: 'ISI, CE', origin: 'India' } },
  { id: 'kitply', name: 'Kitply', tier: 'Standard', priceFactor: 1.2, specs: { material: 'Plywood', finish: 'Natural', warranty: '10 years', certification: 'ISI marked', origin: 'India' } },
  { id: 'archidply', name: 'Archidply', tier: 'Standard', priceFactor: 1.15, specs: { material: 'Plywood, block boards', finish: 'Natural', warranty: '10 years', certification: 'ISI marked', origin: 'India' } },
  { id: 'actiontesa', name: 'Action Tesa', tier: 'Standard', priceFactor: 1.18, specs: { material: 'MDF, HDHMR, particle board', finish: 'Plain, pre-laminated', warranty: '5 years', certification: 'E1 emission', origin: 'India' } },
  { id: 'merino', name: 'Merino', tier: 'Premium', priceFactor: 1.3, specs: { material: 'HPL laminates, panels', finish: 'Suede, gloss, textured', warranty: '10 years', certification: 'Greenguard', origin: 'India' } },
  { id: 'greenlam', name: 'Greenlam', tier: 'Premium', priceFactor: 1.35, specs: { material: 'Laminates, veneers', finish: 'Wide shade range', warranty: '10 years', certification: 'Greenguard, NEMA', origin: 'India' } },
  { id: 'royaletouche', name: 'Royale Touche', tier: 'Standard', priceFactor: 1.2, specs: { material: 'Laminates, wall panels', finish: 'Matt, gloss, metallic', warranty: '7 years', certification: 'ISO 9001', origin: 'India' } },
  { id: 'hafele', name: 'Hafele', tier: 'Premium', priceFactor: 1.55, specs: { material: 'Steel, zinc, aluminium', finish: 'Nickel, chrome, black', warranty: 'Up to 10 years', certification: 'DIN / EN tested', origin: 'Germany' } },
  { id: 'blum', name: 'Blum', tier: 'Premium', priceFactor: 1.7, specs: { material: 'Steel, die-cast', finish: 'Nickel, white, grey', warranty: 'Lifetime (hinges)', certification: 'EN 15570', origin: 'Austria' } },
  { id: 'ozone', name: 'Ozone', tier: 'Standard', priceFactor: 1.2, specs: { material: 'Stainless steel, brass', finish: 'Satin, chrome, black', warranty: '5 years', certification: 'ISO 9001', origin: 'India' } },
  { id: 'europa', name: 'Europa', tier: 'Standard', priceFactor: 1.22, specs: { material: 'Brass, steel', finish: 'Satin, antique', warranty: '5 years', certification: 'ISI marked', origin: 'India' } },
  { id: 'yale', name: 'Yale', tier: 'Premium', priceFactor: 1.5, specs: { material: 'Hardened steel, brass', finish: 'Satin, black', warranty: '2–5 years', certification: 'EN 12209', origin: 'Sweden' } },
  { id: 'pidilite', name: 'Fevicol (Pidilite)', tier: 'Premium', priceFactor: 1.25, specs: { material: 'PVA, synthetic resin', finish: 'Clear when dry', warranty: 'Shelf life 12 months', certification: 'ISI', origin: 'India' } },
  { id: 'asianpaints', name: 'Asian Paints', tier: 'Standard', priceFactor: 1.18, specs: { material: 'PU, melamine, lacquer', finish: 'Matt, satin, gloss', warranty: 'Shelf life 12 months', certification: 'ISO 9001', origin: 'India' } },
  { id: 'wipro', name: 'Wipro Lighting', tier: 'Standard', priceFactor: 1.2, specs: { material: 'Aluminium, polycarbonate', finish: 'White, black, silver', warranty: '2 years', certification: 'BIS', origin: 'India' } },
  { id: 'philips', name: 'Philips', tier: 'Premium', priceFactor: 1.35, specs: { material: 'Aluminium, polycarbonate', finish: 'White, black', warranty: '2–3 years', certification: 'BIS, CE', origin: 'Netherlands' } },
  { id: 'rehau', name: 'Rehau', tier: 'Premium', priceFactor: 1.45, specs: { material: 'PVC, ABS', finish: 'Matched to laminates', warranty: '5 years', certification: 'DIN tested', origin: 'Germany' } },
];

/** Rows shown for each brand on the compare page, in this order. */
export const BRAND_SPEC_FIELDS = [
  { key: 'material', label: 'Material' },
  { key: 'finish', label: 'Finish options' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'certification', label: 'Certification' },
  { key: 'origin', label: 'Brand origin' },
];

const IMG = (file) => `https://tiimg.tistatic.com/fp/1/586/${file}.jpg`;

/** Products. `brandIds` = which brands are available; `basePrice` in INR per `unit`. */
const REAL_PRODUCTS = [
  {
    id: 'aluminium-door-aldrops',
    name: 'Aluminium Door Aldrops',
    category: CATEGORIES.DOOR,
    image: IMG('aluminium-door-aldrops-678'),
    description: 'ISI certified aldrops with a high-quality finish and reliable function.',
    unit: 'piece',
    basePrice: 120,
    brandIds: ['godrej', 'dorset', 'local'],
  },
  {
    id: 'door-hinges',
    name: 'Door Hinges',
    category: CATEGORIES.DOOR,
    image: IMG('door-hinges-676'),
    description: 'Hinges meeting ISI specifications — quality build with a modern design.',
    unit: 'pair',
    basePrice: 90,
    brandIds: ['godrej', 'hettich', 'dorset', 'ebco', 'local'],
  },
  {
    id: 'keyboard-trays',
    name: 'Keyboard Trays',
    category: CATEGORIES.FURNITURE,
    image: IMG('keyboard-trays-671'),
    description: 'Keyboard trays available in various specifications and finishes.',
    unit: 'piece',
    basePrice: 450,
    brandIds: ['hettich', 'ebco', 'local'],
  },
  {
    id: 'cpu-trolley',
    name: 'CPU Trolley',
    category: CATEGORIES.FURNITURE,
    image: IMG('cpu-trolley-672'),
    description: 'CPU trolleys built to international quality standards with functional fittings.',
    unit: 'piece',
    basePrice: 650,
    brandIds: ['ebco', 'local'],
  },
  {
    id: 'tower-bolts',
    name: 'Tower Bolts',
    category: CATEGORIES.DOOR,
    image: IMG('tower-bolts-675'),
    description: 'Tower bolts meeting ISI specifications with an innovative design.',
    unit: 'piece',
    basePrice: 60,
    brandIds: ['godrej', 'dorset', 'local'],
  },
  {
    id: 'aluminium-door-handles',
    name: 'Aluminium Door Handles',
    category: CATEGORIES.DOOR,
    image: IMG('aluminium-door-handles-677'),
    description: 'Aluminium handles meeting ISI specifications with a modern design.',
    unit: 'piece',
    basePrice: 80,
    brandIds: ['godrej', 'dorset', 'ebco', 'local'],
  },
  {
    id: 'cable-manager',
    name: 'Cable Manager',
    category: CATEGORIES.FURNITURE,
    image: IMG('cable-manager-673'),
    description: 'Cable managers built to international standards with a functional design.',
    unit: 'piece',
    basePrice: 70,
    brandIds: ['hettich', 'ebco', 'local'],
  },
  {
    id: 'handles',
    name: 'Handles',
    category: CATEGORIES.FURNITURE,
    image: IMG('handles-680'),
    description: 'Stainless steel, brass, aluminium or M.S handles — customizable sizes, shapes and finishes.',
    unit: 'piece',
    basePrice: 50,
    brandIds: ['godrej', 'hettich', 'dorset', 'ebco', 'local'],
  },
  {
    id: 'key-board-channels',
    name: 'Key Board Channels',
    category: CATEGORIES.FURNITURE,
    image: IMG('key-board-channels-674'),
    description: 'Black steel channels, variable length, smooth sliding, 50 kg load capacity.',
    unit: 'set',
    basePrice: 180,
    brandIds: ['hettich', 'ebco', 'local'],
  },
  {
    id: 'door-closers',
    name: 'Door Closers',
    category: CATEGORIES.DOOR,
    image: IMG('door-closers-679'),
    description: 'Premium door closers in various specifications and finishes, to international standards.',
    unit: 'piece',
    basePrice: 900,
    brandIds: ['godrej', 'hettich', 'dorset', 'local'],
  },
];

/** Every product: the real TradeIndia listings first, then the MOCK interior range. */
export const PRODUCTS = [...REAL_PRODUCTS, ...MOCK_PRODUCTS];
