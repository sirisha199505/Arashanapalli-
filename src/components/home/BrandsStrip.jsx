import { BRANDS } from '../../data/catalog';
import { SECTIONS } from '../../data/content';
import { brandPath, shortBrandName } from '../../utils/catalog';


/** "Trusted brands we stock" — scrolling serif wordmarks, each opening its brand page. */
export default function BrandsStrip() {
  return (
    <section id="brands" className="mx-auto max-w-7xl scroll-mt-[calc(var(--header-h)+1rem)] px-4 py-8">
      <p className="eyebrow text-center">{SECTIONS.brands.eyebrow}</p>
      <p className="mt-2 text-center">
        <a href="/brands" className="text-sm font-semibold text-primary hover:underline">
          Shop by brand →
        </a>
      </p>
      <div className="group relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
          {[0, 1, 2, 3].flatMap((copy) =>
            BRANDS.map((b) => (
              // the marquee repeats the list; only the first copy is reachable by keyboard / screen readers
              <li key={`${copy}-${b.id}`} aria-hidden={copy > 0 || undefined} className="px-10">
                <a href={brandPath(b)} tabIndex={copy > 0 ? -1 : undefined} className="font-display text-3xl font-semibold text-ink/35 transition hover:text-brand">
                  {shortBrandName(b)}
                </a>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
