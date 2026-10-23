import { useState } from 'react';
import { Button, Modal, QuantityInput } from '../ui';
import ProductImage from '../product/ProductImage';
import BrandOption from './BrandOption';
import { getBrandsForProduct, getUnitPrice } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';

/** Step 1 of a quote: pick a brand + quantity for one product. Rendered with `key={product.id}` so state resets per product. */
export default function BrandSelectModal({ product, onClose, onAdd }) {
  const brands = getBrandsForProduct(product);
  const [brandId, setBrandId] = useState(brands[0].id);
  const [quantity, setQuantity] = useState(1);

  const brand = brands.find((b) => b.id === brandId);
  const amount = getUnitPrice(product, brand) * quantity;

  const footer = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="text-xs text-muted">Estimated amount (excl. GST)</p>
        <p className="text-xl font-black text-ink">{formatCurrency(amount)}</p>
      </div>
      <Button size="lg" className="w-full sm:w-auto" onClick={() => onAdd(product.id, brandId, quantity)}>
        Add to {brand.name} Quote
      </Button>
    </div>
  );

  return (
    <Modal open title="Select Brand" onClose={onClose} footer={footer}>
      <div className="mb-4 flex items-center gap-4">
        <ProductImage product={product} className="h-20 w-20 shrink-0 rounded-xl border border-line" />
        <div>
          <h3 className="font-bold">{product.name}</h3>
          <p className="text-sm text-muted">{product.category}</p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-ink">Available brands</legend>
        {brands.map((b) => (
          <BrandOption
            key={b.id}
            brand={b}
            unit={product.unit}
            unitPrice={getUnitPrice(product, b)}
            selected={b.id === brandId}
            onSelect={setBrandId}
          />
        ))}
      </fieldset>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Quantity ({product.unit}s)</span>
        <QuantityInput value={quantity} onChange={setQuantity} />
      </div>
    </Modal>
  );
}
