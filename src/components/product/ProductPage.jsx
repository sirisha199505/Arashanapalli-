import { useState } from 'react';
import { BRAND_SPEC_FIELDS, PRODUCTS } from '../../data/catalog';
import usePageMeta from '../../hooks/usePageMeta';
import { getQuery } from '../../hooks/useRoute';
import { STOCK, brandPath, categoryPath, dynamicCode, getBrandDetails, getBrandsForProduct, getProductSeries, getStartingPrice, getUnitPrice, getVariants, groupByType, nameParts, shortBrandName } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import { whatsAppUrl } from '../../utils/share';
import { Badge, Button, Card, Icon, QuantityInput } from '../ui';
import ProductCard, { PRODUCT_GRID } from './ProductCard';
import ProductImage from './ProductImage';
import VariantPicker from './VariantPicker';

const MORE_COUNT = 8;
const WARRANTY = BRAND_SPEC_FIELDS.find((f) => f.key === 'warranty');

// other products in the same category (one card per product type, not its own sizes / shades), nearest in the catalog first
const relatedTo = (product) => {
  const own = new Set(getVariants(product));
  const siblings = groupByType(PRODUCTS.filter((p) => p.category === product.category && !own.has(p)));
  const at = PRODUCTS.indexOf(product);
  return siblings
    .map((p) => ({ p, distance: Math.abs(PRODUCTS.indexOf(p) - at) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MORE_COUNT)
    .map(({ p }) => p);
};

/** /product/<code>: photo, details, price for every brand, and an order box to add it to the quote. */
export default function ProductPage({ product, onAddToQuote, onOpenQuote, onQuote, compareIds, onToggleCompare }) {
  const brands = getBrandsForProduct(product).sort((a, b) => getUnitPrice(product, a) - getUnitPrice(product, b));
  // ?brand=hettich (e.g. from a dynamic code like AT1002-HET) preselects that brand
  const [brandId, setBrandId] = useState(() => brands.find((b) => b.id === getQuery().get('brand'))?.id ?? brands[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(null); // { brand, quantity } once added
  const brand = brands.find((b) => b.id === brandId) ?? brands[0];
  const compared = compareIds.includes(product.id);
  // the chosen brand's own photo / description / stock, where the shop has set them
  const details = getBrandDetails(product, brand);
  const stock = STOCK[details.stock];

  usePageMeta({
    title: `${product.name}${product.code ? ` (${product.code})` : ''}`,
    description: `${product.name} — ${product.category} from ${brands.length} brands, starting at ${formatCurrency(getStartingPrice(product))} per ${product.unit}. ${product.description ?? ''}`.trim(),
    image: product.image ?? undefined,
  });

  const add = () => {
    onAddToQuote(product, brand.id, quantity);
    setAdded({ brand, quantity });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-48 pt-[calc(var(--header-h)+1.25rem)] lg:pb-14">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted">
        <a href="/" className="hover:text-primary">
          Home
        </a>
        <Icon name="chevronRight" className="h-3 w-3" />
        <a href="/products" className="hover:text-primary">
          Products
        </a>
        <Icon name="chevronRight" className="h-3 w-3" />
        <a href={categoryPath(product.category)} className="hover:text-primary">
          {product.category}
        </a>
        <Icon name="chevronRight" className="h-3 w-3" />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_20rem] lg:items-start">
        <Card className="relative overflow-hidden lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:row-span-2">
          <ProductImage key={details.image ?? product.image} product={details.image ? { ...product, image: details.image } : product} className="aspect-square" padding="p-8" />
          {product.newArrival && (
            <Badge tone="solidPrimary" className="absolute left-3 top-3">
              New arrival
            </Badge>
          )}
        </Card>

        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold leading-tight sm:text-2xl md:text-3xl">{product.name}</h1>
          {product.spec && <p className="mt-1 text-sm text-ink/80">{product.spec}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {product.code && (
              <span>
                Code <span className="font-mono font-semibold text-ink">{product.code}</span>
              </span>
            )}
            <a href={categoryPath(product.category)} className="text-primary hover:underline">
              {product.category}
            </a>
            <span>
              Available in {brands.length} brand{brands.length === 1 ? '' : 's'}
            </span>
          </p>

          <div className="my-4 border-t border-line" />
          <p className="text-sm text-muted">From</p>
          <p className="text-2xl font-bold sm:text-3xl">
            {formatCurrency(getStartingPrice(product))}
            <span className="text-base font-medium text-muted"> / {product.unit}</span>
          </p>
          <p className="mt-1 text-xs text-muted">Prices before GST · the final rate is confirmed with your quote</p>

          <VariantPicker product={product} brandId={brand?.id} />

          {product.description && <p className="mt-4 leading-relaxed text-ink/90">{product.description}</p>}

        </div>

        {/* order box */}
        <Card className="p-5 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:row-span-2">
          <p className="text-2xl font-bold">
            {formatCurrency(getUnitPrice(product, brand))}
            <span className="text-sm font-medium text-muted"> / {product.unit}</span>
          </p>
          <p className="text-xs text-muted">
            in{' '}
            <a href={brandPath(brand)} className="hover:text-primary hover:underline">
              {brand.name}
            </a>{' '}
            · item code <span className="font-mono font-semibold text-ink">{dynamicCode(product, brand)}</span>
          </p>
          {stock && (
            <Badge tone={stock.tone} className="mt-2">
              {stock.label}
            </Badge>
          )}
          {details.description && <p className="mt-2 text-sm text-ink/80">{details.description}</p>}

          <label className="mt-4 block text-xs font-medium text-muted" htmlFor="order-brand">
            Brand
          </label>
          <select
            id="order-brand"
            value={brand.id}
            onChange={(e) => setBrandId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {formatCurrency(getUnitPrice(product, b))}
              </option>
            ))}
          </select>

          <p className="mt-4 text-xs font-medium text-muted">Quantity ({product.unit})</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <QuantityInput value={quantity} onChange={setQuantity} />
            <span className="text-sm font-semibold">{formatCurrency(getUnitPrice(product, brand) * quantity)}</span>
          </div>

          <Button className="mt-5 w-full rounded-full" onClick={add}>
            Add to quote
          </Button>
          <Button
            as="a"
            href={whatsAppUrl(`Hi, I'd like a price for ${product.name} in ${brand.name} (code ${dynamicCode(product, brand)}), quantity ${quantity} ${product.unit}.`)}
            target="_blank"
            rel="noreferrer"
            variant="whatsapp"
            className="mt-2 w-full rounded-full"
          >
            <Icon name="chat" className="h-4 w-4" /> Ask on WhatsApp
          </Button>

          {added && (
            <div role="status" className="mt-4 rounded-xl bg-emerald-600/10 p-3 text-sm text-emerald-800">
              <p className="flex items-center gap-2 font-semibold">
                <Icon name="checkCircle" className="h-4 w-4" /> Added to your quote
              </p>
              <p className="mt-0.5 text-xs">
                {added.quantity} {product.unit} in {added.brand.name} · {dynamicCode(product, added.brand)}
              </p>
              <button onClick={onOpenQuote} className="mt-2 text-sm font-semibold text-primary hover:underline">
                View quote →
              </button>
            </div>
          )}

          <label className="mt-4 flex cursor-pointer items-center gap-2 border-t border-line pt-4 text-sm text-muted hover:text-primary">
            <input type="checkbox" checked={compared} onChange={() => onToggleCompare(product.id)} className="h-4 w-4 accent-primary" />
            Compare brands for this product
          </label>
        </Card>

        {/* prices by brand: under the details on wide screens, after the order box on phones */}
        <div className="min-w-0 lg:col-start-2">
            <h2 className="mb-2 font-semibold">Prices by brand</h2>
            <Card className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[32rem] text-sm">
                <thead className="border-b border-line text-left text-xs text-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Brand</th>
                    <th className="px-4 py-2 font-medium">Item code</th>
                    <th className="px-4 py-2 font-medium">{WARRANTY?.label ?? 'Warranty'}</th>
                    <th className="whitespace-nowrap px-4 py-2 text-right font-medium">Price / {product.unit}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {brands.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setBrandId(b.id)}
                      aria-selected={b.id === brand.id}
                      className={`cursor-pointer transition ${b.id === brand.id ? 'bg-primary/5' : 'hover:bg-surface-2'}`}
                    >
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2">
                          <input type="radio" name="brand" checked={b.id === brand.id} onChange={() => setBrandId(b.id)} className="h-4 w-4 accent-primary" aria-label={b.name} />
                          <a href={brandPath(b)} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-primary hover:underline">
                            {b.name}
                          </a>
                          {b.tier && <Badge tone={b.tier}>{b.tier}</Badge>}
                        </span>
                        {getProductSeries(product, b) && <span className="ml-6 block text-xs text-muted">{getProductSeries(product, b).name} series</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs font-semibold">{dynamicCode(product, b)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted">{b.specs?.warranty ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold">
                        {formatCurrency(getUnitPrice(product, b))}
                        {STOCK[getBrandDetails(product, b).stock] && <span className="block text-[11px] font-medium text-muted">{STOCK[getBrandDetails(product, b).stock].label}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            {/* phones: one row per brand instead of a wide table */}
            <Card className="divide-y divide-line sm:hidden">
              {brands.map((b) => (
                <label key={b.id} className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${b.id === brand.id ? 'bg-primary/5' : ''}`}>
                  <input type="radio" name="brand-phone" checked={b.id === brand.id} onChange={() => setBrandId(b.id)} className="h-4 w-4 shrink-0 accent-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-medium">{shortBrandName(b)}</span>
                      {b.tier && <Badge tone={b.tier}>{b.tier}</Badge>}
                    </span>
                    <span className="block text-xs text-muted">
                      <span className="font-mono">{dynamicCode(product, b)}</span>
                      {b.specs?.warranty && <> · {b.specs.warranty} warranty</>}
                    </span>
                  </span>
                  <span className="text-right font-semibold">
                    {formatCurrency(getUnitPrice(product, b))}
                    {STOCK[getBrandDetails(product, b).stock] && <span className="block text-[11px] font-medium text-muted">{STOCK[getBrandDetails(product, b).stock].label}</span>}
                  </span>
                </label>
              ))}
            </Card>
        </div>
      </div>

      {/* phones and tablets: price and Add to quote always at hand, as in the Amazon app */}
      <div className="fixed inset-x-0 bottom-16 z-30 px-3 sm:bottom-5 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 pl-4 shadow-2xl">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-lg font-bold">
              {formatCurrency(getUnitPrice(product, brand) * quantity)}
              {quantity > 1 && <span className="text-xs font-medium text-muted"> for {quantity}</span>}
            </p>
            <p className="truncate text-xs text-muted">
              {added ? `✓ Added · ${added.quantity} in ${shortBrandName(added.brand)}` : `${shortBrandName(brand)} · ${nameParts(product).variant || product.unit}`}
            </p>
          </div>
          {added ? (
            <Button variant="secondary" className="shrink-0 rounded-full px-5" onClick={onOpenQuote}>
              View quote
            </Button>
          ) : (
            <Button className="shrink-0 rounded-full px-5" onClick={add}>
              Add to quote
            </Button>
          )}
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">More in {product.category}</h2>
          <a href={categoryPath(product.category)} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
            See all <Icon name="arrow" className="h-4 w-4" />
          </a>
        </div>
        <div className={PRODUCT_GRID}>
          {relatedTo(product).map((p) => (
            <ProductCard key={p.id} product={p} onQuote={onQuote} compared={compareIds.includes(p.id)} onToggleCompare={onToggleCompare} />
          ))}
        </div>
      </section>
    </main>
  );
}
