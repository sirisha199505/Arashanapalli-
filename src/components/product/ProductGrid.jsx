import { EmptyState } from '../ui';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onQuote, compareIds, onToggleCompare }) {
  if (!products.length) {
    return <EmptyState title="No products found" message="Try a different search or category." />;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuote={onQuote}
          compared={compareIds.includes(product.id)}
          onToggleCompare={onToggleCompare}
        />
      ))}
    </div>
  );
}
