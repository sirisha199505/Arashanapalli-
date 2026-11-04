import { BRAND_SPEC_FIELDS } from '../../data/catalog';
import { brandPath, getBrandProducts, groupByType } from '../../utils/catalog';
import { Badge, Card } from '../ui';

const ORIGIN = BRAND_SPEC_FIELDS.find((f) => f.key === 'origin');

/** A brand (the sub-class) with its series (the individual level) as links. `onSelect` turns it into a picker instead of a link. */
export default function BrandCard({ brand, onSelect, selected = false }) {
  // one per product type (sizes / shades together), the same count the brand's page shows
  const count = groupByType(getBrandProducts(brand)).length;
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{brand.name}</p>
          <p className="text-xs text-muted">
            <span className="font-mono font-semibold text-ink/70">{brand.code}</span> · {count.toLocaleString('en-IN')} products
            {ORIGIN && brand.specs?.origin && ` · ${brand.specs.origin}`}
          </p>
        </div>
        <Badge tone={brand.tier}>{brand.tier}</Badge>
      </div>
      {brand.series?.length > 0 && (
        <p className="mt-2 line-clamp-2 text-xs text-muted">
          Series: <span className="text-ink/80">{brand.series.map((s) => s.name).join(', ')}</span>
        </p>
      )}
    </>
  );
  const className = `block p-4 text-left ${selected ? 'border-primary ring-2 ring-primary/20' : ''}`;
  return onSelect ? (
    <Card as="button" type="button" interactive onClick={() => onSelect(brand)} aria-pressed={selected} className={`w-full ${className}`}>
      {body}
    </Card>
  ) : (
    <Card as="a" href={brandPath(brand)} interactive className={className}>
      {body}
    </Card>
  );
}
