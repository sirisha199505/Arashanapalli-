import { QuantityInput } from '../ui';
import ProductImage from '../product/ProductImage';
import LineBrandSelect from './LineBrandSelect';
import { formatCurrency } from '../../utils/format';

/** A quote line in two rows (so nothing gets squeezed): product + remove, then its brand, quantity and amount. */
export default function QuoteLineRow({ line, onSetBrand, onSetQuantity, onRemove }) {
  const { key, product, quantity, available, unitPrice, amount } = line;
  return (
    <li className="flex gap-3 py-3">
      <ProductImage product={product} className="h-12 w-12 shrink-0 rounded-lg border border-line" padding="p-1" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm font-semibold">
            {product.name}
            {available && <span className="font-normal text-ink/70"> · {formatCurrency(unitPrice)} / {product.unit}</span>}
          </p>
          <button onClick={() => onRemove(key)} className="shrink-0 text-xs font-semibold text-primary hover:underline" aria-label={`Remove ${product.name}`}>
            Remove
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="min-w-[10rem] flex-1">
            <LineBrandSelect line={line} onChange={onSetBrand} />
          </div>
          <QuantityInput value={quantity} onChange={(q) => onSetQuantity(key, q)} />
          <p className="w-20 text-right text-sm font-bold">{available ? formatCurrency(amount) : '—'}</p>
        </div>
      </div>
    </li>
  );
}
