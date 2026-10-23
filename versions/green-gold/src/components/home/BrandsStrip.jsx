import { BRANDS } from '../../data/catalog';
import { SECTIONS } from '../../data/content';
import { shortBrandName } from '../../utils/catalog';

const NAMES = BRANDS.map(shortBrandName);

/** "Trusted brands we stock" — scrolling serif wordmarks. */
export default function BrandsStrip() {
  return (
    <section id="brands" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10">
      <p className="eyebrow text-center">{SECTIONS.brands.eyebrow}</p>
      <div className="group relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
          {[...NAMES, ...NAMES, ...NAMES, ...NAMES].map((name, i) => (
            <li key={i} className="px-10 font-display text-3xl font-semibold text-ink/35 transition hover:text-brand">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
