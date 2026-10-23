import { memo } from 'react';
import { Badge, Button, Card } from '../ui';
import ProductImage from './ProductImage';
import { getBrandsForProduct, getStartingPrice } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

function ProductCard({ product, onQuote }) {
  const brands = getBrandsForProduct(product);
  return (
    <Card as="article" interactive className="group flex flex-col overflow-hidden">
      <div className="relative">
        <ProductImage product={product} className="aspect-[4/3]" />
        <Badge tone="overlay" className="absolute left-3 top-3">{product.category}</Badge>
        <Badge tone="solidSuccess" className="absolute right-3 top-3">
          {brands.length} brands
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-primary">{brands.map((b) => b.name.split(' ')[0]).join(' · ')}</p>
        <h3 className="mt-1 text-[17px] font-semibold">{product.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] text-muted">Starting from</p>
            <p className="text-lg font-bold text-brand">
              {formatCurrency(getStartingPrice(product))}
              <span className="text-xs font-medium text-muted"> /{product.unit}</span>
            </p>
          </div>
          <Button size="sm" onClick={() => onQuote(product)}>
            Get Quote
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default memo(ProductCard);
