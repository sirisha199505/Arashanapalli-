import { QuantityInput } from '../ui';
import ProductImage from '../product/ProductImage';
import { shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

export default function QuoteLineRow({ line, onQuantityChange, onRemove }) {
  const { key, product, brand, quantity, unitPrice, amount } = line;
  return (
    <li className="grid grid-cols-[3rem_1fr_auto] items-center gap-x-3 gap-y-2 py-3 sm:flex">
      <ProductImage product={product} className="h-12 w-12 shrink-0 rounded-lg border border-line" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{product.name}</p>
        <p className="text-xs text-muted">
          <span className="font-semibold text-primary">{shortBrandName(brand)}</span> · {formatCurrency(unitPrice)} / {product.unit}
        </p>
      </div>
      <QuantityInput value={quantity} onChange={(q) => onQuantityChange(key, q)} />
      <p className="col-start-2 text-sm font-bold sm:w-24 sm:text-right">{formatCurrency(amount)}</p>
      <button onClick={() => onRemove(key)} className="text-xs text-primary hover:underline" aria-label={`Remove ${product.name}`}>
        Remove
      </button>
    </li>
  );
}
