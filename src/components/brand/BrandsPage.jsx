import usePageMeta from '../../hooks/usePageMeta';
import { getBrandsByTier } from '../../utils/catalog';
import Page from '../layout/Page';
import BrandCard from './BrandCard';

const TIER_NOTES = {
  Premium: 'Top international and Indian names — longest warranties, best finish.',
  Standard: 'Trusted everyday brands — the best balance of price and quality.',
  Economy: 'Budget-friendly options for value projects.',
};

/** /brands: every brand, grouped by class (tier) — each opens its own page with its series and products. */
export default function BrandsPage() {
  usePageMeta({ title: 'Brands', description: 'Hettich, Godrej, Hafele, Greenply, Century and more — compare brands by class and browse their products and series.' });
  return (
    <Page eyebrow="Shop by brand" title="Brands" subtitle="Grouped by class · open a brand to see its series and products">
      <div className="space-y-10">
        {getBrandsByTier().map(({ tier, brands }) => (
          <section key={tier} aria-labelledby={`tier-${tier}`}>
            <div className="mb-3">
              <h2 id={`tier-${tier}`} className="text-xl font-semibold">
                {tier} <span className="text-sm font-normal text-muted">· {brands.length} brand{brands.length === 1 ? '' : 's'}</span>
              </h2>
              {TIER_NOTES[tier] && <p className="text-sm text-muted">{TIER_NOTES[tier]}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {brands.map((b) => (
                <BrandCard key={b.id} brand={b} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}
