import { memo } from 'react';
import { useQuote } from '../../context/QuoteContext';
import { Badge, Button, Card } from '../ui';
import ProductImage from './ProductImage';
import { dynamicCode, getBrandsForProduct, getProductSeries, getStartingPrice, getUnitPrice, productPath } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

/** Grid for product cards: a list on phones (Amazon app style), tiles from tablets up. */
export const PRODUCT_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-4';

/**
 * Compact Amazon-style product card: photo, 2-line title, code, price, Add to quote. Photo and title open the product page.
 * With `brand` (on a brand's page) it shows that brand's price, series and dynamic code, and adds the product in that brand.
 */
function ProductCard({ product, brand, onQuote, compared, onToggleCompare }) {
  const brands = getBrandsForProduct(product);
  const href = brand ? `${productPath(product)}?brand=${brand.id}` : productPath(product);
  const series = brand && getProductSeries(product, brand);
  // already selected? show its quantity with − / + instead of the button
  const { state, setQuantity } = useQuote();
  const quantity = state.items.find((i) => i.productId === product.id)?.quantity ?? 0;
  return (
    <Card as="article" interactive className="group flex overflow-hidden sm:flex-col">
      <a href={href} className="relative block w-32 shrink-0 self-stretch sm:w-auto" tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} className="h-full min-h-32 sm:aspect-square sm:h-auto" />
        {product.newArrival && (
          <Badge tone="solidPrimary" className="absolute left-2 top-2">
            New
          </Badge>
        )}
      </a>
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <a href={href} className="line-clamp-2 text-sm font-medium leading-snug text-ink hover:text-primary sm:text-[15px]">
          {product.name}
        </a>
        <p className="mt-1 truncate text-[11px] text-muted">
          {product.code && (
            <>
              <span className="font-mono font-semibold text-ink/80">{dynamicCode(product, brand)}</span> ·{' '}
            </>
          )}
          {brand ? (series ? `${series.name} series` : brand.name) : `${brands.length} brand${brands.length === 1 ? '' : 's'}`}
        </p>
        <p className="mt-2 leading-none">
          {!brand && <span className="text-[11px] text-muted">From </span>}
          <span className="text-lg font-bold text-ink sm:text-xl">{formatCurrency(brand ? getUnitPrice(product, brand) : getStartingPrice(product))}</span>
          <span className="text-xs text-muted"> /{product.unit}</span>
        </p>
        <span className="flex-1" />
        <div className="mt-3 flex items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted hover:text-primary">
            <input type="checkbox" checked={compared} onChange={() => onToggleCompare(product.id)} className="h-3.5 w-3.5 accent-primary" />
            Compare
          </label>
          {quantity > 0 ? (
            <div className="flex items-center overflow-hidden rounded-full border border-primary/50 bg-primary/5">
              <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} aria-label={`One less ${product.name}`} className="grid h-8 w-8 place-items-center font-bold text-primary hover:bg-primary/10">
                −
              </button>
              <span className="min-w-6 text-center text-sm font-bold text-primary" aria-label={`${quantity} in quote`}>
                {quantity}
              </span>
              <button type="button" onClick={() => setQuantity(product.id, quantity + 1)} aria-label={`One more ${product.name}`} className="grid h-8 w-8 place-items-center font-bold text-primary hover:bg-primary/10">
                +
              </button>
            </div>
          ) : (
            <Button size="sm" className="rounded-full px-4" onClick={() => onQuote(product, brand)}>
              Add to quote
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default memo(ProductCard);
