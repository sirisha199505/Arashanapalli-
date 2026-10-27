/**
 * MOCK DATA — a full interior-traders catalogue so the site can be built and tested at realistic size.
 * Every product here is generated: names are typical trade items, prices are SAMPLE rates, nothing is a real listing.
 * Replace this file with your real products (or delete it and its import in catalog.js) before going live.
 *
 * Each entry below is one product type; it expands into one product per variant (thickness, size, finish, shade…).
 * `price` is the base rate for the first variant; `steps` multiplies it per variant (bigger / thicker costs more).
 */

/** Category names (shared with catalog.js so filters, icons and quotes all agree). */
export const MOCK_CATEGORIES = {
  PLYWOOD: 'Plywood',
  BOARDS: 'Boards & MDF',
  LAMINATES: 'Laminates',
  VENEERS: 'Veneers',
  WALL_PANELS: 'Wall Panels',
  LOCKS: 'Locks',
  KITCHEN: 'Kitchen Fittings',
  WARDROBE: 'Wardrobe Fittings',
  GLASS: 'Glass & Aluminium Fittings',
  LOCKERS: 'Safety Lockers',
  ADHESIVES: 'Adhesives & Polish',
  EDGE_BANDING: 'Edge Banding',
  FASTENERS: 'Screws & Fasteners',
  DOORS: 'Doors & Frames',
  FLOORING: 'Flooring',
  LIGHTING: 'Lighting & LED Profiles',
};

const C = MOCK_CATEGORIES;
const DOOR = 'Door Hardware';
const FURNITURE = 'Furniture Accessories';

const THICKNESS_PLY = ['4 mm', '6 mm', '9 mm', '12 mm', '16 mm', '19 mm', '25 mm'];
const THICKNESS_BOARD = ['6 mm', '12 mm', '18 mm', '25 mm'];
const HW_FINISHES = ['SS Satin', 'Antique Brass', 'Black Matt', 'Rose Gold', 'Chrome', 'Gold PVD'];
const SHADES = ['Frosty White', 'Ivory', 'Classic Walnut', 'Natural Teak', 'Light Oak', 'Graphite Grey', 'Charcoal Black', 'Champagne', 'Smoked Elm', 'Dusky Beige', 'Olive Green', 'Navy Blue'];
const PANEL_COLOURS = ['White', 'Walnut', 'Teak', 'Grey', 'Black', 'Oak', 'Beige', 'Wenge'];
const WIDTHS = ['450 mm', '600 mm', '750 mm', '900 mm'];
const SIZES_3 = ['Small', 'Medium', 'Large'];
const PACKS = ['500 g / 500 ml', '1 kg / 1 L', '5 kg / 5 L'];
const DOOR_SIZES = ['30 × 80 in', '32 × 80 in', '36 × 80 in', '36 × 84 in'];
const FLOOR_FINISHES = ['Natural Oak', 'Walnut', 'Grey Ash', 'Teak', 'White Wash', 'Hickory'];

const PLY_BRANDS = ['greenply', 'century', 'kitply', 'archidply', 'local'];
const BOARD_BRANDS = ['greenply', 'century', 'actiontesa', 'local'];
const LAM_BRANDS = ['merino', 'greenlam', 'royaletouche', 'century', 'local'];
const DOOR_BRANDS = ['godrej', 'dorset', 'hafele', 'europa', 'ozone', 'local'];
const LOCK_BRANDS = ['godrej', 'yale', 'dorset', 'europa', 'hafele'];
const FIT_BRANDS = ['hettich', 'hafele', 'ebco', 'blum', 'ozone', 'local'];
const KITCHEN_BRANDS = ['hettich', 'hafele', 'ebco', 'blum', 'local'];

/** [category, product type, unit, base price (₹), variants, brandIds, description, price step per variant] */
const TYPES = [
  // Plywood — per 8 × 4 ft sheet, price grows with thickness
  [C.PLYWOOD, 'MR Grade Plywood', 'sheet', 520, THICKNESS_PLY, PLY_BRANDS, 'Moisture-resistant plywood for interior furniture and panelling.', 1.35],
  [C.PLYWOOD, 'BWR Plywood', 'sheet', 680, THICKNESS_PLY, PLY_BRANDS, 'Boiling-water-resistant plywood for kitchens and bathrooms.', 1.35],
  [C.PLYWOOD, 'BWP Marine Plywood', 'sheet', 820, THICKNESS_PLY, PLY_BRANDS, 'Waterproof marine-grade plywood with a borer and termite guarantee.', 1.35],
  [C.PLYWOOD, 'Fire Retardant Plywood', 'sheet', 950, THICKNESS_PLY, PLY_BRANDS, 'Fire-retardant plywood for offices, malls and public spaces.', 1.35],
  [C.PLYWOOD, 'Flexible Plywood', 'sheet', 900, ['4 mm', '6 mm', '9 mm'], PLY_BRANDS, 'Bendable plywood for curved furniture and arches.', 1.3],
  [C.PLYWOOD, 'Shuttering Plywood', 'sheet', 600, ['12 mm', '18 mm'], PLY_BRANDS, 'Film-faced plywood for concrete shuttering.', 1.3],
  [C.PLYWOOD, 'Gurjan Plywood', 'sheet', 880, THICKNESS_PLY, PLY_BRANDS, 'Gurjan-face plywood with a smooth, dense finish.', 1.35],
  [C.PLYWOOD, 'Calibrated Plywood', 'sheet', 760, THICKNESS_PLY, PLY_BRANDS, 'Uniform-thickness plywood for modular furniture.', 1.35],
  [C.PLYWOOD, 'Commercial Plywood', 'sheet', 420, THICKNESS_PLY, PLY_BRANDS, 'Economical plywood for dry interior use.', 1.35],

  // Boards & MDF
  [C.BOARDS, 'Block Board', 'sheet', 1100, THICKNESS_BOARD, BOARD_BRANDS, 'Solid-core block board for doors, shelves and long spans.', 1.3],
  [C.BOARDS, 'MDF Board', 'sheet', 700, THICKNESS_BOARD, BOARD_BRANDS, 'Smooth medium-density fibreboard, ideal for painted and CNC work.', 1.3],
  [C.BOARDS, 'HDHMR Board', 'sheet', 1300, THICKNESS_BOARD, BOARD_BRANDS, 'High-density, high-moisture-resistant board for modular kitchens.', 1.3],
  [C.BOARDS, 'Pre-laminated Particle Board', 'sheet', 900, THICKNESS_BOARD, BOARD_BRANDS, 'Ready-laminated particle board for wardrobes and office furniture.', 1.25],
  [C.BOARDS, 'Flush Door', 'piece', 2400, ['30 mm', '32 mm', '35 mm'], BOARD_BRANDS, 'Solid-core flush door, ready for laminate or veneer.', 1.15],
  [C.BOARDS, 'Plain Particle Board', 'sheet', 600, THICKNESS_BOARD, BOARD_BRANDS, 'Plain particle board for laminating and back panels.', 1.25],
  [C.BOARDS, 'Pre-laminated MDF', 'sheet', 1100, THICKNESS_BOARD, BOARD_BRANDS, 'Ready-laminated MDF for kitchens and wardrobes.', 1.25],
  [C.BOARDS, 'Exterior Grade MDF', 'sheet', 1250, THICKNESS_BOARD, BOARD_BRANDS, 'Moisture-resistant MDF for semi-exposed areas.', 1.25],

  // Laminates — finish × thickness × shade
  ...['Suede', 'High Gloss', 'Matt', 'Textured', 'Wood Grain', 'Stone Finish', 'Anti-fingerprint', 'Acrylic'].flatMap((finish, i) =>
    ['0.8 mm', '1 mm'].map((thick, j) => [
      C.LAMINATES,
      `${finish} Laminate ${thick}`,
      'sheet',
      850 + i * 120 + j * 250,
      SHADES,
      LAM_BRANDS,
      `${finish} decorative laminate (${thick}), 8 × 4 ft, for furniture and wall cladding.`,
      1.04,
    ]),
  ),

  // Veneers — species × type
  ...['Teak', 'Burma Teak', 'Walnut', 'American Oak', 'Smoked Oak', 'Ash', 'Maple', 'Sapele', 'Rosewood', 'Zebrano'].map((wood, i) => [
    C.VENEERS,
    `${wood} Veneer`,
    'sheet',
    1800 + i * 220,
    ['Natural', 'Recon', 'Dyed', 'Pre-polished'],
    ['greenply', 'century', 'greenlam', 'local'],
    `${wood} decorative veneer, 8 × 4 ft, 4 mm backer.`,
    0.85,
  ]),

  // Wall panels — type × colour
  ...[
    ['PVC Wall Panel', 450],
    ['WPC Fluted Panel', 780],
    ['Charcoal Louvers', 1150],
    ['3D Wall Panel', 980],
    ['Acrylic Wall Panel', 1600],
    ['UV Marble Sheet', 1900],
    ['Wooden Slat Panel', 2100],
    ['Soffit Ceiling Panel', 650],
  ].map(([name, price]) => [C.WALL_PANELS, name, 'panel', price, PANEL_COLOURS, ['royaletouche', 'merino', 'greenlam', 'local'], `${name} for feature walls and ceilings.`, 1.02]),

  // Door hardware — type × finish
  ...[
    ['Mortise Handle Set', 650],
    ['Lever Handle on Rose', 520],
    ['Pull Handle', 380],
    ['Door Stopper', 140],
    ['Door Magnet', 160],
    ['Door Viewer', 220],
    ['Door Kick Plate', 420],
    ['Floor Spring', 3200],
    ['Ball Bearing Hinge', 180],
    ['Door Chain', 190],
    ['Tower Bolt', 120],
    ['Aldrop', 160],
    ['Butt Hinge', 90],
    ['Sliding Door Handle', 340],
    ['Window Handle', 150],
    ['Window Stay', 110],
    ['Hydraulic Door Closer', 1400],
    ['Door Handle Lock Set', 1800],
  ].map(([name, price]) => [DOOR, name, 'piece', price, HW_FINISHES, DOOR_BRANDS, `${name} in a range of finishes for wooden and metal doors.`, 1.06]),

  // Locks — type × grade
  ...[
    ['Cylindrical Lock', 900],
    ['Mortise Lock Body', 750],
    ['Main Door Lock', 2400],
    ['Pad Lock', 320],
    ['Cupboard Lock', 260],
    ['Drawer Lock', 220],
    ['Rim Lock', 1100],
    ['Glass Door Lock', 1500],
    ['Digital Door Lock', 12500],
    ['Smart Wi-Fi Lock', 16500],
    ['Shutter Lock', 650],
    ['Almirah Lock', 380],
    ['Night Latch', 1200],
    ['Mortise Cylinder', 850],
  ].map(([name, price]) => [C.LOCKS, name, 'piece', price, ['Standard', 'Heavy Duty', 'Premium'], LOCK_BRANDS, `${name} — tested for daily use and security.`, 1.35]),

  // Furniture accessories — type × size
  ...[
    ['Telescopic Channel', 'pair', 260, ['300 mm', '400 mm', '450 mm', '500 mm']],
    ['Soft-close Hinge', 'piece', 140, ['0° Full Overlay', 'Half Overlay', 'Inset', '165° Wide Angle']],
    ['Auto Hinge', 'piece', 60, ['Full Overlay', 'Half Overlay', 'Inset', 'Corner']],
    ['Cabinet Handle', 'piece', 120, ['96 mm', '128 mm', '160 mm', '224 mm']],
    ['Cabinet Knob', 'piece', 70, ['Round', 'Square', 'T-bar', 'Crystal']],
    ['Sofa Leg', 'set', 480, ['4 inch', '6 inch', '8 inch', '10 inch']],
    ['Gas Lift', 'piece', 380, ['60 N', '80 N', '100 N', '120 N']],
    ['Table Grommet', 'piece', 90, ['60 mm', '80 mm', '100 mm', 'Rectangular']],
    ['Shelf Support', 'pack', 80, ['5 mm', '6 mm', 'Glass', 'Heavy Duty']],
    ['Furniture Lock', 'piece', 180, ['Drawer', 'Cupboard', 'Glass Door', 'Push Lock']],
    ['Under-mount Drawer Slide', 'pair', 1400, ['300 mm', '400 mm', '450 mm', '500 mm']],
    ['Furniture Castor Wheel', 'set', 320, ['40 mm', '50 mm', '65 mm', '75 mm']],
    ['Hydraulic Bed Lift', 'set', 4200, ['Single', 'Double', 'Queen', 'King']],
    ['Bed Fitting', 'set', 260, ['Single', 'Double', 'Queen', 'King']],
    ['Cabinet Leg', 'set', 380, ['100 mm', '150 mm', '200 mm', 'Adjustable']],
    ['Push-to-open Latch', 'piece', 150, ['Short', 'Long', 'Magnetic', 'Heavy Duty']],
    ['Office Chair Base', 'piece', 1100, ['Nylon', 'Chrome', 'Aluminium', 'Heavy Duty']],
    ['Keyboard Tray Slide', 'pair', 450, ['400 mm', '450 mm', '500 mm', 'Ball Bearing']],
  ].map(([name, unit, price, sizes]) => [FURNITURE, name, unit, price, sizes, FIT_BRANDS, `${name} for modular furniture.`, 1.12]),

  // Kitchen fittings — type × cabinet width
  ...[
    ['Cutlery Tray', 900],
    ['Plate Rack Basket', 2400],
    ['Cup & Saucer Basket', 2100],
    ['Bottle Pull-out', 3200],
    ['Wicker Basket', 2600],
    ['Tandem Drawer', 4800],
    ['Dustbin Pull-out', 2800],
    ['Tall Unit Pantry Pull-out', 14500],
    ['Magic Corner', 16000],
    ['Lift-up Flap System', 5200],
    ['Profile Handle', 650],
    ['Corner Carousel', 7800],
    ['Spice Pull-out', 2900],
    ['Thali Basket', 2300],
    ['Grain Trolley', 6800],
    ['Detergent Holder', 1500],
    ['Under-sink Basket', 2200],
    ['Roller Shutter', 5600],
    ['Glass Pull-out', 4400],
    ['Kitchen Skirting', 900],
  ].map(([name, price]) => [C.KITCHEN, name, 'piece', price, WIDTHS, KITCHEN_BRANDS, `${name} for modular kitchens, stainless steel.`, 1.12]),

  // Wardrobe fittings — type × width
  ...[
    ['Sliding Wardrobe System', 6500],
    ['Wardrobe Hanger Rod', 450],
    ['Pull-down Hanger', 5400],
    ['Trouser Pull-out', 2800],
    ['Tie & Belt Rack', 1600],
    ['Shoe Rack Pull-out', 3200],
    ['Mirror Pull-out', 3800],
    ['Wardrobe LED Light', 900],
    ['Wardrobe Basket', 1900],
    ['Saree Rack', 2600],
    ['Accessory Tray', 1400],
    ['Jewellery Drawer Insert', 1700],
  ].map(([name, price]) => [C.WARDROBE, name, 'piece', price, ['600 mm', '900 mm', '1200 mm'], KITCHEN_BRANDS, `${name} for bedroom wardrobes.`, 1.18]),

  // Glass & aluminium fittings — type × finish
  ...[
    ['Glass Patch Fitting', 1400],
    ['Shower Hinge', 1200],
    ['Glass Clamp', 260],
    ['Spider Fitting', 1800],
    ['Glass Door Handle', 1100],
    ['Glass Shelf Bracket', 220],
    ['Sliding Glass Door Kit', 6800],
    ['Aluminium Profile Shutter', 2400],
    ['Glass Floor Spring', 4800],
    ['Glass-to-Glass Connector', 420],
    ['Sliding Partition Track', 3600],
    ['Aluminium Glass Profile', 1200],
    ['Glass Door Lock', 1600],
  ].map(([name, price]) => [C.GLASS, name, 'piece', price, ['SS Satin', 'Chrome', 'Black'], ['ozone', 'dorset', 'hafele', 'local'], `${name} for glass partitions, doors and showers.`, 1.08]),

  // Safety lockers — type × size
  ...[
    ['Home Locker', 9500],
    ['Office Safe', 18000],
    ['Jewellery Safe', 14000],
    ['Fire Resistant Safe', 32000],
    ['Digital Safe', 12000],
    ['Steel Almirah', 16500],
    ['Hotel Room Safe', 11000],
    ['Cash Box', 1800],
    ['Key Cabinet', 2600],
  ].map(([name, price]) => [C.LOCKERS, name, 'piece', price, SIZES_3, ['godrej', 'ozone', 'yale', 'local'], `${name} with multi-lever locking.`, 1.45]),

  // Adhesives & polish — type × pack size
  ...[
    ['Wood Adhesive', 180],
    ['Contact Adhesive', 260],
    ['Epoxy Adhesive', 320],
    ['Silicone Sealant', 210],
    ['Wood Filler', 160],
    ['PU Polish', 650],
    ['Melamine Polish', 420],
    ['Wood Primer', 280],
    ['Lacquer', 380],
    ['Thinner', 150],
    ['Hot Melt Glue', 240],
    ['Instant Adhesive', 120],
    ['Tile Adhesive', 380],
    ['Wood Stain', 340],
    ['NC Sealer', 300],
    ['PU Sealer', 520],
    ['Duco Paint', 460],
  ].map(([name, price]) => [C.ADHESIVES, name, 'pack', price, PACKS, ['pidilite', 'asianpaints', 'local'], `${name} for wood and laminate work.`, 1.85]),

  // Edge banding — colour × width
  ...['White', 'Ivory', 'Walnut', 'Teak', 'Oak', 'Grey', 'Black', 'Wenge', 'Maple', 'Cherry', 'Beige', 'Champagne', 'Olive', 'Navy', 'Silver', 'Gold'].map((colour) => [
    C.EDGE_BANDING,
    `${colour} Edge Band Tape`,
    'roll',
    450,
    ['22 mm × 0.8 mm', '22 mm × 2 mm', '45 mm × 2 mm'],
    ['rehau', 'merino', 'local'],
    `${colour} PVC edge band, 50 m roll.`,
    1.6,
  ]),

  // Screws & fasteners — type × size
  ...[
    ['Wood Screw', 120],
    ['Drywall Screw', 140],
    ['Confirmat Screw', 220],
    ['Wire Nail', 90],
    ['Wall Plug', 60],
    ['Anchor Fastener', 340],
    ['Minifix Connector', 380],
    ['Self-tapping Screw', 130],
    ['Chipboard Screw', 150],
    ['Hinge Screw', 110],
    ['Bolt & Nut', 260],
    ['Shelf Pin', 70],
  ].map(([name, price]) => [C.FASTENERS, name, 'box', price, ['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6'], ['hettich', 'hafele', 'local'], `${name}, box of 100.`, 1.15]),

  // Doors & frames — type × size
  ...[
    ['WPC Door', 6500],
    ['WPC Door Frame', 3200],
    ['Membrane Door', 5200],
    ['Laminated Flush Door', 4800],
    ['Teak Wood Door Frame', 9800],
  ].map(([name, price]) => [C.DOORS, name, 'piece', price, DOOR_SIZES, ['greenply', 'century', 'local'], `${name}, ready to install.`, 1.06]),

  // Flooring — type × finish
  ...[
    ['Laminate Flooring 8 mm', 'box', 1900],
    ['Laminate Flooring 12 mm', 'box', 2600],
    ['SPC Flooring', 'box', 3100],
    ['Vinyl Plank Flooring', 'box', 2200],
    ['Engineered Wood Flooring', 'box', 6800],
    ['Floor Skirting', 'piece', 350],
  ].map(([name, unit, price]) => [C.FLOORING, name, unit, price, FLOOR_FINISHES, ['actiontesa', 'greenlam', 'merino', 'local'], `${name} for homes and offices.`, 1.03]),

  // Lighting & LED profiles — type × variant
  ...[
    ['LED Strip Light', 'roll', 650, ['Warm White', 'Cool White', 'Natural White', 'RGB']],
    ['Aluminium LED Profile', 'piece', 480, ['Surface', 'Recessed', 'Corner', 'Handle Profile']],
    ['Cabinet Spot Light', 'piece', 380, ['Warm White', 'Cool White', 'Natural White', 'Black Body']],
    ['Motion Sensor Light', 'piece', 720, ['300 mm', '600 mm', '900 mm', 'Battery']],
    ['LED Panel Light', 'piece', 540, ['6 W', '12 W', '18 W', '24 W']],
    ['LED Driver', 'piece', 420, ['12 V 30 W', '12 V 60 W', '24 V 60 W', '24 V 100 W']],
  ].map(([name, unit, price, variants]) => [C.LIGHTING, name, unit, price, variants, ['hafele', 'hettich', 'wipro', 'philips', 'local'], `${name} for kitchens, wardrobes and false ceilings.`, 1.2]),
];

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Expands every product type into one product per variant. */
export const MOCK_PRODUCTS = TYPES.flatMap(([category, type, unit, price, variants, brandIds, description, step]) =>
  variants.map((variant, i) => ({
    id: slug(`${type} ${variant}`),
    name: `${type} – ${variant}`,
    category,
    image: null, // no photo yet — the UI shows the category icon instead
    description,
    unit,
    basePrice: Math.round((price * step ** i) / 5) * 5,
    brandIds,
    mock: true,
  })),
);
