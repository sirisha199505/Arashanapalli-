import { useState } from 'react';
import { useQuote } from '../../context/QuoteContext';
import { PACKAGES } from '../../data/catalog';
import { getBrand, getProduct, productPath, shortBrandName } from '../../utils/catalog';
import { Button, Card, Icon } from '../ui';

const SHOWN_ITEMS = 4; // items listed on a card before "+ N more"

/**
 * Ready-made packages from the admin (Admin › Packages, marked "On website"), e.g. "Modular kitchen hardware set":
 * one click adds every product in it to the quote, in the package's brand where it names one.
 * Renders nothing when there are no packages.
 */
export default function PackagesStrip({ title = 'Ready-made packages', className = '' }) {
  const { addItem, setItemBrand } = useQuote();
  const [added, setAdded] = useState(null); // id of the package just added
  if (!PACKAGES.length) return null;

  const addPackage = (pkg) => {
    pkg.items.forEach((i) => {
      addItem(i.productId, i.quantity);
      if (i.brandId) setItemBrand(i.productId, i.brandId);
    });
    setAdded(pkg.id);
  };

  return (
    <section className={className}>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Icon name="grid" className="h-5 w-5 text-primary" /> {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PACKAGES.map((pkg) => {
          const items = pkg.items.filter((i) => getProduct(i.productId));
          return (
            <Card key={pkg.id} className="flex flex-col p-4">
              <p className="font-semibold">{pkg.name}</p>
              {pkg.description && <p className="mt-0.5 text-xs text-muted">{pkg.description}</p>}
              <ul className="my-3 flex-1 space-y-1 text-xs">
                {items.slice(0, SHOWN_ITEMS).map((i) => {
                  const product = getProduct(i.productId);
                  return (
                    <li key={i.productId} className="flex justify-between gap-2">
                      <a href={productPath(product) + (i.brandId ? `?brand=${i.brandId}` : '')} className="min-w-0 truncate hover:text-primary hover:underline">
                        {product.name}
                      </a>
                      <span className="shrink-0 text-muted">
                        × {i.quantity}
                        {i.brandId && getBrand(i.brandId) && ` · ${shortBrandName(getBrand(i.brandId))}`}
                      </span>
                    </li>
                  );
                })}
                {items.length > SHOWN_ITEMS && <li className="text-muted">+ {items.length - SHOWN_ITEMS} more</li>}
              </ul>
              <Button size="sm" className="w-full" variant={added === pkg.id ? 'secondary' : undefined} onClick={() => addPackage(pkg)}>
                {added === pkg.id ? (
                  <>
                    <Icon name="checkCircle" className="h-4 w-4" /> Added — add again
                  </>
                ) : (
                  `Add all ${items.length} to quote`
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
