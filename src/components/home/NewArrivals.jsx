import { useState } from 'react';
import { SECTIONS } from '../../data/content';
import { categoryPath, getNewArrivalCategories, getNewArrivals } from '../../utils/catalog';
import ProductCard, { PRODUCT_GRID } from '../product/ProductCard';
import { Chip, Icon, Section } from '../ui';

const SHOWN = 8;

/** Home page: the latest products, one tab per category. */
export default function NewArrivals({ onQuote, compareIds, onToggleCompare }) {
  const categories = getNewArrivalCategories();
  const [active, setActive] = useState(categories[0]);
  if (!categories.length) return null;
  const products = getNewArrivals(active).slice(0, SHOWN);

  return (
    <Section
      id="new-arrivals"
      {...SECTIONS.newArrivals}
      action={
        <a href="/new-arrivals" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
          View all <Icon name="arrow" className="h-4 w-4" />
        </a>
      }
    >
      <div role="tablist" aria-label="New arrivals by category" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <Chip key={c} role="tab" className="shrink-0" aria-selected={c === active} active={c === active} onClick={() => setActive(c)}>
            <span className="whitespace-nowrap">{c}</span>
          </Chip>
        ))}
      </div>
      <div className={PRODUCT_GRID}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onQuote={onQuote} compared={compareIds.includes(p.id)} onToggleCompare={onToggleCompare} />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
        <a href={categoryPath(active)} className="text-primary hover:underline">
          See all {active}
        </a>
        <a href="/new-arrivals" className="text-muted hover:text-primary sm:hidden">
          All new arrivals
        </a>
      </div>
    </Section>
  );
}
