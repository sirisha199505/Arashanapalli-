import { Icon } from '../ui';
import { getBrandsForProduct, getUnitPrice } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

/** Per-item brand dropdown: every brand that makes the product, with its price. Lets one quote mix brands. */
export default function LineBrandSelect({ line, onChange }) {
  const { key, product, brand, available } = line;
  const value = brand && available ? brand.id : '';
  return (
    <div className="relative w-full max-w-[14rem]">
      <select
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        aria-label={`Brand for ${product.name}`}
        className={`h-8 w-full cursor-pointer appearance-none rounded-lg border bg-surface pl-2.5 pr-7 text-xs outline-none focus:ring-2 focus:ring-primary/20 ${
          value ? 'border-line font-semibold text-ink focus:border-primary' : 'border-primary/60 font-semibold text-primary'
        }`}
      >
        <option value="" disabled>
          {brand ? `Not in ${brand.name} — choose another` : 'Choose brand'}
        </option>
        {getBrandsForProduct(product).map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} — {formatCurrency(getUnitPrice(product, b))}/{product.unit}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/60" />
    </div>
  );
}
