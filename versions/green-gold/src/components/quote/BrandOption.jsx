import { Badge } from '../ui';
import { formatCurrency } from '../../utils/format';

export default function BrandOption({ brand, unitPrice, unit, selected, onSelect }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition ${
        selected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-line hover:border-primary/60'
      }`}
    >
      <span className="flex items-center gap-3">
        <input type="radio" name="brand" checked={selected} onChange={() => onSelect(brand.id)} className="accent-[var(--primary)]" />
        <span className="space-y-1">
          <span className="block font-semibold">{brand.name}</span>
          <Badge tone={brand.tier}>{brand.tier}</Badge>
        </span>
      </span>
      <span className="shrink-0 whitespace-nowrap text-right">
        <span className="block font-bold">{formatCurrency(unitPrice)}</span>
        <span className="text-xs text-muted">per {unit}</span>
      </span>
    </label>
  );
}
