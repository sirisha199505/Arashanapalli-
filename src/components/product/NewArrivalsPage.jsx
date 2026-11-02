import { SECTIONS } from '../../data/content';
import usePageMeta from '../../hooks/usePageMeta';
import { categoryPath, getNewArrivalCategories, getNewArrivals } from '../../utils/catalog';
import Page from '../layout/Page';
import { EmptyState, Icon } from '../ui';
import ProductCard, { PRODUCT_GRID } from './ProductCard';

/** /new-arrivals: every new arrival, grouped by category, each group linking to its category page. */
export default function NewArrivalsPage({ onQuote, compareIds, onToggleCompare }) {
  usePageMeta({
    title: 'New Arrivals',
    description: 'The latest door hardware, plywood, laminates, fittings and interior products at Arashanapalli Traders, Secunderabad.',
  });
  const categories = getNewArrivalCategories();

  return (
    <Page {...SECTIONS.newArrivals}>
      {!categories.length && <EmptyState title="Nothing new right now" message="Check back soon — new products are added regularly." />}
      <div className="space-y-10">
        {categories.map((c) => (
          <section key={c}>
            <div className="mb-3 flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold">{c}</h2>
              <a href={categoryPath(c)} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                See all <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
            <div className={PRODUCT_GRID}>
              {getNewArrivals(c).map((p) => (
                <ProductCard key={p.id} product={p} onQuote={onQuote} compared={compareIds.includes(p.id)} onToggleCompare={onToggleCompare} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}
