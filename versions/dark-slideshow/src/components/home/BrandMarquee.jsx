import { BRANDS } from '../../data/catalog';
import { SECTIONS } from '../../data/content';
import { getBrandProductCount, initials } from '../../utils/catalog';
import { Card, Section } from '../ui';

const ITEMS = BRANDS.map((b) => ({ ...b, count: getBrandProductCount(b.id), short: initials(b.name) }));

function BrandTile({ brand }) {
  return (
    <Card className="flex w-56 shrink-0 items-center gap-3 px-4 py-3">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-sm font-black text-primary">{brand.short}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">{brand.name}</span>
        <span className="text-xs text-muted">{brand.count} products</span>
      </span>
    </Card>
  );
}

/** Infinite scrolling brand row (list rendered twice for a seamless loop). */
export default function BrandMarquee() {
  return (
    <Section id="brands" {...SECTIONS.brands}>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {[...ITEMS, ...ITEMS].map((brand, i) => (
            <BrandTile key={`${brand.id}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </Section>
  );
}
