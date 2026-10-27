import { useState } from 'react';
import { Button, EmptyState } from '../ui';
import ProductCard from './ProductCard';

const PAGE = 12;

/** Renders the first 12 products, then more on request — keeps the home page light on large catalogs. Parent passes a `key` per filter to reset. */
export default function ProductGrid({ products, onQuote, compareIds, onToggleCompare }) {
  const [limit, setLimit] = useState(PAGE);
  if (!products.length) {
    return <EmptyState title="No products found" message="Try a different search or category." />;
  }
  const remaining = products.length - limit;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {products.slice(0, limit).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuote={onQuote}
            compared={compareIds.includes(product.id)}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </div>
      {remaining > 0 && (
        <div className="text-center">
          <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
            Show more ({remaining} left)
          </Button>
        </div>
      )}
    </div>
  );
}
