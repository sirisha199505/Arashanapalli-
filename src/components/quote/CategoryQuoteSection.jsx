import { Button, Card, Icon } from '../ui';
import ProductImage from '../product/ProductImage';
import QuoteLineRow from './QuoteLineRow';
import { PRODUCTS } from '../../data/catalog';
import { QUOTE_PAGE } from '../../data/content';
import { getStartingPrice } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

/** One category's part of the combined quote: its lines, subtotal and a picker to add more of its products. */
export default function CategoryQuoteSection({ section, onAddProduct, onQuantityChange, onRemove }) {
  const { category, lines, subtotal } = section;
  const products = PRODUCTS.filter((p) => p.category === category);
  return (
    <Card as="section" className="p-4 sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon name={QUOTE_PAGE.icons[category]} className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">{category}</h2>
            <p className="text-xs text-muted">
              {lines.length} item{lines.length === 1 ? '' : 's'} in quote
            </p>
          </div>
        </div>
        <p className="text-right">
          <span className="block text-[11px] text-muted">Subtotal</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </p>
      </header>

      {lines.length ? (
        <ul className="mt-3 divide-y divide-line">
          {lines.map((line) => (
            <QuoteLineRow key={line.key} line={line} onQuantityChange={onQuantityChange} onRemove={onRemove} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
          No {category.toLowerCase()} added yet — pick from below.
        </p>
      )}

      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Add {category}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-3 rounded-xl border border-line p-2">
              <ProductImage product={product} className="h-11 w-11 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-muted">from {formatCurrency(getStartingPrice(product))}/{product.unit}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onAddProduct(product)} aria-label={`Add ${product.name}`}>
                + Add
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
