import { SPACES } from '../../data/content';
import { Icon } from '../ui';

const fade = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent';

/** Applications gallery: a large feature panel followed by image cards, edge to edge. */
export default function Spaces({ onCta }) {
  return (
    <section id="applications" className="grid scroll-mt-24 grid-cols-2 lg:h-[26rem] lg:grid-cols-[2.2fr_1fr_1fr_1fr_1fr]">
      <div className="relative col-span-2 h-72 overflow-hidden text-white lg:col-span-1 lg:h-auto">
        <img src={SPACES.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-center p-8 lg:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">{SPACES.eyebrow}</p>
          <h2 className="mt-3 max-w-xs font-display text-3xl font-semibold leading-tight md:text-4xl">{SPACES.title}</h2>
          <button onClick={onCta} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold transition hover:bg-primary-hover">
            Request a Quote <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {SPACES.items.map((item) => (
        <div key={item.title} className="group relative h-64 overflow-hidden text-white lg:h-auto">
          <img src={item.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className={fade} />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
            <div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs text-white/75">{item.text}</p>
            </div>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/70 transition group-hover:bg-white group-hover:text-ink">
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
