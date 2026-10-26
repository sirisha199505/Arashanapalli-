import { useEffect, useState } from 'react';
import { HERO, HERO_SIDE } from '../../data/content';
import { getStats } from '../../utils/catalog';
import { Icon } from '../ui';

const STATS = getStats();
const SLIDE_MS = 7000;

/** Staggered entrance delay for the i-th hero element. */
const delay = (i) => ({ animationDelay: `${100 + i * 110}ms` });

/**
 * One slide. Phones: the portrait media fills the screen behind the copy.
 * Desktop: blurred cover fills the area and the full media sits contained (never cropped) in a rounded frame.
 */
function HeroMedia({ slide, active }) {
  const media =
    'absolute inset-0 h-full w-full object-cover lg:static lg:h-full lg:w-auto lg:max-w-full lg:rounded-2xl lg:object-contain lg:shadow-2xl lg:shadow-black/40 lg:ring-1 lg:ring-white/15';
  return (
    <div className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${active ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!active}>
      <img src={slide.image} alt="" className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-2xl brightness-75 lg:block" />
      <div className="absolute inset-0 lg:flex lg:items-center lg:justify-center lg:px-4 lg:pb-8 lg:pt-[5.5rem]">
        {/* only the visible reel loads its video; others show their cover */}
        {slide.video && active ? (
          <video src={slide.video} poster={slide.image} autoPlay muted loop playsInline className={media} />
        ) : (
          <img src={slide.image} alt={slide.title} className={media} />
        )}
      </div>
    </div>
  );
}

/** Full-bleed cinematic hero: media on the right fading into ivory, copy on the left. */
export default function Hero({ slides, onExplore, onRequestQuote }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.slides.length;

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(id);
  });

  return (
    <section id="top" className="relative isolate h-svh min-h-[38rem] overflow-hidden bg-dark lg:min-h-[40rem] lg:bg-bg">
      {/* media: full screen on phones, the right 60% on desktop */}
      <div
        className="absolute inset-0 overflow-hidden lg:left-[40%]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.slides.map((s, i) => (
          <HeroMedia key={s.id} slide={s} active={i === index} />
        ))}
        {/* phones: dark fade under the copy · desktop: soft blend into the ivory copy side */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 via-45% to-black/10 lg:bg-gradient-to-r lg:from-bg lg:via-bg/60 lg:via-12% lg:to-transparent lg:to-30%" />

        <div className="absolute right-8 top-28 hidden text-white xl:block">
          <p className="text-[11px] font-semibold uppercase leading-5 tracking-[0.3em]">
            {HERO_SIDE.title.map((t) => (
              <span key={t} className="block">
                {t}
              </span>
            ))}
          </p>
          <span className="my-4 block h-px w-8 bg-white/70" />
          <ul className="space-y-1.5 text-sm text-white/80">
            {HERO_SIDE.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

      </div>

      {/* copy */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-24 text-white sm:pb-14 lg:items-center lg:pb-0 lg:pt-16 lg:text-ink">
        <div className="max-w-xl">
          <p style={delay(0)} className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-white/75 lg:text-muted">
            {HERO.eyebrow}
          </p>
          <h1 style={delay(1)} className="animate-fade-up mt-4 text-[2.5rem] font-light leading-[0.98] tracking-tight sm:text-6xl lg:mt-5 xl:text-7xl">
            {HERO.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block font-normal text-[#ff5a5f] lg:text-primary">{HERO.highlight}</span>
          </h1>
          <p style={delay(2)} className="animate-fade-up mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base lg:mt-6 lg:text-lg lg:text-muted">
            {HERO.subtitle}
          </p>

          <div style={delay(3)} className="animate-fade-up mt-6 flex gap-3 lg:mt-8">
            <button onClick={onExplore} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm sm:px-7 sm:py-3.5 font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover">
              Explore Products <Icon name="arrow" className="h-4 w-4" />
            </button>
            <button onClick={onRequestQuote} className="rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur transition hover:border-primary hover:text-primary sm:px-7 sm:py-3.5 lg:border-ink/25 lg:bg-surface/60">
              Request a Quote
            </button>
          </div>

          <dl style={delay(4)} className="animate-fade-up mt-7 flex divide-x divide-white/20 lg:mt-10 lg:divide-line">
            {STATS.map((s) => (
              <div key={s.key} className="px-4 first:pl-0 sm:px-6">
                <dd className="text-xl font-semibold">{s.value}</dd>
                <dt className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 lg:text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
