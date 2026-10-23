/**
 * SINGLE SOURCE OF TRUTH for all static business data.
 * Every component reads company / brand / product info from here — nothing is hard-coded in the UI.
 *
 * Products & images: taken from https://www.tradeindia.com/arashanapalli-traders-265860/
 * Brands & prices: SAMPLE values — the TradeIndia page lists no brands or prices.
 *                  Replace them with your real brands and rates (later this file can be swapped for an API).
 */

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

/** Interior lines we sell but don't list individually yet — enquiry only (from Instagram). */
export const INTERIOR_LINES = ['Plywood', 'Laminates', 'Veneers', 'Wall Panels', 'Safety Lockers'];

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

export const CATEGORIES = {
  DOOR: 'Door Hardware',
  FURNITURE: 'Furniture Accessories',
};

export const CATEGORY_ICONS = {
  [CATEGORIES.DOOR]: 'door',
  [CATEGORIES.FURNITURE]: 'monitor',
};


/** Brands. `priceFactor` scales a product's base price to give a per-brand rate. */
export const BRANDS = [
  { id: 'godrej', name: 'Godrej', tier: 'Premium', priceFactor: 1.35 },
  { id: 'hettich', name: 'Hettich', tier: 'Premium', priceFactor: 1.5 },
  { id: 'dorset', name: 'Dorset', tier: 'Standard', priceFactor: 1.15 },
  { id: 'ebco', name: 'Ebco', tier: 'Standard', priceFactor: 1.1 },
  { id: 'local', name: 'Arashanapalli (House Brand)', tier: 'Economy', priceFactor: 1 },
];

const IMG = (file) => `https://tiimg.tistatic.com/fp/1/586/${file}.jpg`;

/** Products. `brandIds` = which brands are available; `basePrice` in INR per `unit`. */
export const PRODUCTS = [
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
