import { useState } from 'react';
import Icon from '../ui/Icon';
import { getCategoryIcon } from '../../utils/catalog';
import ProductIllustration, { illustrationKind } from './ProductIllustration';

/**
 * Product photo on a white plate (the photos have white backgrounds). Without a photo (or if it fails to load) a drawn
 * picture of the product type, and failing that a dummy image with the category icon.
 */
export default function ProductImage({ product, className = '', padding = 'p-3' }) {
  const [failed, setFailed] = useState(false);
  if (!product.image || failed) {
    return illustrationKind(product) ? <DrawnImage product={product} className={className} /> : <DummyImage product={product} className={className} />;
  }
  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={`h-full w-full object-contain ${padding} mix-blend-multiply transition duration-300 group-hover:scale-105`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// soft colour pairs (background, accent) — each category always gets the same one
const TONES = [
  ['#F4EDE4', '#9A6B3F'], // wood
  ['#EAF0EC', '#4E7A5E'], // sage
  ['#EDEFF5', '#4F5F8A'], // slate blue
  ['#F6ECEC', '#A0464A'], // brick
  ['#EEF3F5', '#3F7486'], // teal
  ['#F5F0E1', '#8C7330'], // brass
  ['#F1ECF4', '#76558A'], // plum
  ['#ECEDEE', '#55595F'], // steel
];
const toneOf = (text) => TONES[[...String(text)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TONES.length];

/** The drawn picture of the product on the category's soft colour, marked "Illustration" where there's room. */
function DrawnImage({ product, className }) {
  const [bg] = toneOf(product.category);
  return (
    <div
      role="img"
      aria-label={`${product.name} (illustration)`}
      className={`@container relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: `radial-gradient(circle at 30% 20%, #fff 0%, ${bg} 80%)` }}
    >
      <ProductIllustration product={product} className="h-[86%] w-[86%] transition duration-300 group-hover:scale-105" />
      <span className="absolute bottom-2 left-2 hidden rounded @[9rem]:block bg-white/70 px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-ink/50">Illustration</span>
    </div>
  );
}

/**
 * DUMMY product image until the shop adds real photos: the category's colour and icon, the product type and its
 * variant ("BWR Plywood" / "12 mm"), marked "Sample image" (small thumbnails show just the icon).
 * Drawn in the page, so nothing to download or host.
 */
function DummyImage({ product, className }) {
  const [bg, accent] = toneOf(product.category);
  const [type, variant] = product.name.split(' – ');
  return (
    <div
      role="img"
      aria-label={`${product.name} (sample image)`}
      className={`@container relative flex flex-col items-center justify-center gap-[6%] overflow-hidden p-[8%] text-center ${className}`}
      style={{ background: `radial-gradient(circle at 30% 20%, #fff 0%, ${bg} 70%)`, color: accent }}
    >
      {/* large faint icon behind, for texture */}
      <Icon name={getCategoryIcon(product.category)} className="pointer-events-none absolute -bottom-[12%] -right-[12%] h-[60%] w-[60%] opacity-[0.07] [stroke-width:1]" />
      <span className="grid aspect-square w-[28%] min-w-8 max-w-24 place-items-center rounded-full bg-white/80 shadow-sm ring-1 ring-black/5 transition duration-300 group-hover:scale-105">
        <Icon name={getCategoryIcon(product.category)} className="h-1/2 w-1/2 [stroke-width:1.5]" />
      </span>
      <span className="hidden font-display font-semibold @[9rem]:line-clamp-2 leading-tight" style={{ fontSize: 'clamp(0.7rem, 7.5cqi, 1.6rem)' }}>
        {type}
      </span>
      {variant && (
        <span className="hidden rounded-full bg-white/80 px-2.5 @[9rem]:inline-block py-0.5 font-semibold ring-1 ring-black/5" style={{ fontSize: 'clamp(0.6rem, 4.5cqi, 0.95rem)' }}>
          {variant}
        </span>
      )}
      <span className="absolute bottom-2 left-2 hidden rounded @[9rem]:block bg-white/70 px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-ink/50">Sample image</span>
    </div>
  );
}
