import { EmptyState } from '../ui';
import ProductCard, { PRODUCT_GRID } from './ProductCard';

/** A grid (a list on phones) of product cards; with `brand`, every card shows that brand's price and code. */
export default function ProductGrid({ products, brand, onQuote, compareIds, onToggleCompare }) {
  if (!products.length) {
    return <EmptyState title="No products found" message="Try a different search, category or filter." />;
  }
  return (
    <div className={PRODUCT_GRID}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} brand={brand} onQuote={onQuote} compared={compareIds.includes(product.id)} onToggleCompare={onToggleCompare} />
      ))}
    </div>
  );
}
