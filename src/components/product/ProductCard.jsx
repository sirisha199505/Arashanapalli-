import { memo } from 'react';
import { Badge, Button, Card } from '../ui';
import ProductImage from './ProductImage';
import { getBrandsForProduct, getStartingPrice } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

function ProductCard({ product, onQuote, compared, onToggleCompare }) {
  const brands = getBrandsForProduct(product);
  return (
    <Card as="article" interactive className="group flex flex-col overflow-hidden">
      <div className="relative">
        <ProductImage product={product} className="aspect-[4/3]" />
        <Badge tone="overlay" className="absolute left-3 top-3 max-sm:hidden">{product.category}</Badge>
        <Badge tone="solidSuccess" className="absolute right-2 top-2 sm:right-3 sm:top-3">
          {brands.length} brands
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="hidden truncate text-[11px] font-semibold uppercase tracking-wider text-primary sm:block">{brands.map((b) => b.name.split(' ')[0]).join(' · ')}</p>
        <h3 className="text-sm font-semibold leading-snug sm:mt-1 sm:text-[17px]">{product.name}</h3>
        <p className="mt-1 hidden line-clamp-2 text-sm text-muted sm:block">{product.description}</p>
        <span className="flex-1" />
        <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold text-muted hover:text-primary">
          <input type="checkbox" checked={compared} onChange={() => onToggleCompare(product.id)} className="accent-[var(--primary)]" />
          Compare brands
        </label>
        <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] text-muted">Starting from</p>
            <p className="text-base font-bold text-brand sm:text-lg">
              {formatCurrency(getStartingPrice(product))}
              <span className="text-xs font-medium text-muted"> /{product.unit}</span>
            </p>
          </div>
          <Button size="sm" className="w-full sm:w-auto" onClick={() => onQuote(product)}>
            Get Quote
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default memo(ProductCard);
