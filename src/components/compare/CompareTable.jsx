import { Badge, Button } from '../ui';
import ProductImage from '../product/ProductImage';
import { BRAND_SPEC_FIELDS } from '../../data/catalog';
import { shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const cell = 'border border-line px-3 py-3 align-top';
const labelCell = `${cell} sticky left-0 z-10 bg-surface-2 text-left text-sm font-semibold`;
// alternate row shading so each spec / product reads across the brands
const rowClass = 'even:bg-surface-2/40';

const GroupRow = ({ span, children }) => (
  <tr>
    <th colSpan={span} className="border border-line bg-primary/10 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-primary">
      {children}
    </th>
  </tr>
);

/** Side-by-side table: one column per brand — specs, then a price per product, then totals and an add-to-quote action. */
export default function CompareTable({ comparison, onAddBrand }) {
  const { products, columns, cheapest } = comparison;
  const span = columns.length + 1;
  return (
    <div className="overflow-x-auto rounded-xl bg-surface">
      <table className="w-full min-w-[36rem] table-fixed border-collapse text-sm">
        <thead className="bg-dark text-white">
          <tr>
            <th className={`${cell} sticky left-0 z-10 w-44 bg-dark text-left text-sm font-semibold sm:w-56`}>Brand</th>
            {columns.map(({ brand }) => (
              <th key={brand.id} className={`${cell} text-left`}>
                <span className="block text-base font-bold">{brand.name}</span>
                <Badge tone={brand.tier} className="mt-1">
                  {brand.tier}
                </Badge>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <GroupRow span={span}>Specifications</GroupRow>
          {BRAND_SPEC_FIELDS.map((field) => (
            <tr key={field.key} className={rowClass}>
              <th className={labelCell}>{field.label}</th>
              {columns.map(({ brand }) => (
                <td key={brand.id} className={cell}>
                  {brand.specs[field.key]}
                </td>
              ))}
            </tr>
          ))}

          <GroupRow span={span}>Price per unit (excl. GST)</GroupRow>
          {products.map((product) => (
            <tr key={product.id} className={rowClass}>
              <th className={labelCell}>
                <span className="flex items-center gap-2">
                  <ProductImage product={product} className="h-9 w-9 shrink-0 rounded-lg border border-line" />
                  <span>
                    {product.name}
                    <span className="block text-xs font-normal text-muted">per {product.unit}</span>
                  </span>
                </span>
              </th>
              {columns.map(({ brand, prices }) => {
                const price = prices[product.id];
                if (price === null) return <td key={brand.id} className={`${cell} text-muted`}>Not available</td>;
                const best = price === cheapest[product.id] && columns.length > 1;
                return (
                  <td key={brand.id} className={cell}>
                    <span className={`font-bold ${best ? 'text-brand' : ''}`}>{formatCurrency(price)}</span>
                    {best && (
                      <Badge tone="success" className="ml-2">
                        Best price
                      </Badge>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr className="bg-primary/5">
            <th className={labelCell}>
              Total
              <span className="block text-xs font-normal text-muted">1 unit of each available item</span>
            </th>
            {columns.map(({ brand, total, available }) => (
              <td key={brand.id} className={cell}>
                <span className="block text-base font-black">{formatCurrency(total)}</span>
                <span className="text-xs text-muted">
                  {available} of {products.length} products available
                </span>
              </td>
            ))}
          </tr>
          <tr>
            <th className={labelCell} />
            {columns.map(({ brand, available }) => (
              <td key={brand.id} className={cell}>
                <Button size="sm" disabled={!available} onClick={() => onAddBrand(brand.id)}>
                  Add {shortBrandName(brand)} to quote
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
