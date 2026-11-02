import { getNewArrivals } from '../../utils/catalog';
import ProductCard from './ProductCard';

/** "New in <category>" row at the top of a category page. Renders nothing when the category has no new arrivals. */
export default function NewArrivalsStrip({ category, onQuote, compareIds, onToggleCompare }) {
  const products = getNewArrivals(category).slice(0, 3);
  if (!products.length) return null;
  return (
    <section className="border-b border-line pb-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">New</span>
        New in {category}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onQuote={onQuote} compared={compareIds.includes(p.id)} onToggleCompare={onToggleCompare} />
        ))}
      </div>
    </section>
  );
}
