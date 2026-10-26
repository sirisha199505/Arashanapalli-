import { Button } from '../ui';
import { BRAND_SPEC_FIELDS } from '../../data/catalog';
import { shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

const cell = 'border border-line px-3 py-2.5 text-left align-top';
const labelCell = `${cell} sticky left-0 bg-surface font-medium text-muted`;

const GroupRow = ({ span, children }) => (
  <tr>
    <th colSpan={span} className={`${cell} bg-surface-2 font-semibold`}>
      {children}
    </th>
  </tr>
);

/** Plain comparison table: brands across the top; specs, then a price per product, then the total. */
export default function CompareTable({ comparison, onAddBrand }) {
  const { products, columns, cheapest } = comparison;
  const span = columns.length + 1;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] table-fixed border-collapse bg-surface text-sm">
        <thead>
          <tr className="bg-surface-2">
            <th className={`${cell} sticky left-0 w-40 bg-surface-2 sm:w-52`} />
            {columns.map(({ brand }) => (
              <th key={brand.id} className={cell}>
                <span className="block font-bold">{brand.name}</span>
                <span className="text-xs font-normal text-muted">{brand.tier}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <GroupRow span={span}>Specifications</GroupRow>
          {BRAND_SPEC_FIELDS.map((field) => (
            <tr key={field.key}>
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
            <tr key={product.id}>
              <th className={labelCell}>
                {product.name} <span className="font-normal">/ {product.unit}</span>
              </th>
              {columns.map(({ brand, prices }) => {
                const price = prices[product.id];
                const best = price !== null && price === cheapest[product.id] && columns.length > 1;
                return (
                  <td key={brand.id} className={`${cell} ${best ? 'font-semibold text-brand' : ''}`}>
                    {price === null ? <span className="text-muted">—</span> : formatCurrency(price)}
                    {best && <span className="ml-1 text-xs">(lowest)</span>}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr>
            <th className={`${labelCell} font-semibold text-ink`}>Total</th>
            {columns.map(({ brand, total }) => (
              <td key={brand.id} className={`${cell} font-bold`}>
                {formatCurrency(total)}
              </td>
            ))}
          </tr>
          <tr>
            <th className={labelCell} />
            {columns.map(({ brand, available }) => (
              <td key={brand.id} className={cell}>
                <Button size="sm" variant="secondary" disabled={!available} onClick={() => onAddBrand(brand.id)}>
                  Add {shortBrandName(brand)}
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">— = not available in this brand. Total is 1 unit of each available product.</p>
    </div>
  );
}
