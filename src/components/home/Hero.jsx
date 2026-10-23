import { useEffect, useState } from 'react';
import { HERO, HERO_SIDE } from '../../data/content';
import { getStats } from '../../utils/catalog';
import { Icon } from '../ui';

const STATS = getStats();
const SLIDE_MS = 7000;

/** Staggered entrance delay for the i-th hero element. */
const delay = (i) => ({ animationDelay: `${100 + i * 110}ms` });

const roundBtn = 'grid h-10 w-10 place-items-center rounded-full border border-white/50 text-white transition hover:bg-white hover:text-ink';

/** One slide: blurred cover fills the area, the full media sits contained (never cropped) in a rounded frame. */
function HeroMedia({ slide, active }) {
  const media = 'h-full w-auto max-w-full rounded-2xl object-contain shadow-2xl shadow-black/40 ring-1 ring-white/15';
  return (
    <div className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${active ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!active}>
      <img src={slide.image} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75" />
      <div className="absolute inset-0 flex items-center justify-center px-6 pb-20 pt-20 lg:pb-24 lg:pt-24">
        {slide.video ? (
          <video src={slide.video} poster={slide.image} autoPlay muted loop playsInline className={media} />
        ) : (
          <img src={slide.image} alt={slide.title} className={media} />
        )}
      </div>
    </div>
  );
}

/** Full-bleed cinematic hero: media on the right fading into ivory, copy on the left. */
export default function Hero({ slides, onExplore, onRequestQuote, onOpenSlide }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.slides.length;
  const go = (dir) => setIndex((i) => (i + dir + count) % count);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(id);
  });

  return (
    <section id="top" className="relative isolate overflow-hidden bg-bg lg:h-svh lg:min-h-[40rem]">
      {/* media: a banner on phones, the right ~70% on desktop */}
      <div
        className="relative h-[55svh] lg:absolute lg:inset-y-0 lg:left-[30%] lg:right-0 lg:h-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.slides.map((s, i) => (
          <HeroMedia key={s.id} slide={s} active={i === index} />
        ))}
        {/* soft blend into the ivory copy side (stops before the framed media) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg to-transparent to-25% lg:bg-gradient-to-r lg:from-bg lg:via-bg/40 lg:via-15% lg:to-transparent lg:to-30%" />

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

        <div className="absolute bottom-5 right-4 flex items-center gap-6 text-white lg:bottom-8 lg:right-8">
          <button onClick={() => onOpenSlide(index)} className="group hidden items-center gap-3 text-sm font-semibold sm:flex">
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/80 transition group-hover:bg-white group-hover:text-ink">
              <Icon name="play" className="ml-0.5 h-4 w-4" />
            </span>
            Watch Our Story
          </button>
          <ol className="flex gap-5 text-xs font-semibold">
            {slides.slides.map((s, i) => (
              <li key={s.id}>
                <button onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} className={`flex flex-col items-center gap-1.5 ${i === index ? 'text-white' : 'text-white/55 hover:text-white'}`}>
                  {String(i + 1).padStart(2, '0')}
                  <span className={`h-1 w-1 rounded-full bg-white transition ${i === index ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              </li>
            ))}
          </ol>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous slide" className={roundBtn}>
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <button onClick={() => go(1)} aria-label="Next slide" className={roundBtn}>
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* copy */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 pb-12 lg:pb-0 lg:pt-16">
        <div className="max-w-xl">
          <p style={delay(0)} className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {HERO.eyebrow}
          </p>
          <h1 style={delay(1)} className="animate-fade-up mt-5 text-5xl font-light leading-[0.98] tracking-tight sm:text-6xl xl:text-7xl">
            {HERO.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block font-normal text-primary">{HERO.highlight}</span>
          </h1>
          <p style={delay(2)} className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">
            {HERO.subtitle}
          </p>

          <div style={delay(3)} className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <button onClick={onExplore} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover">
              Explore Products <Icon name="arrow" className="h-4 w-4" />
            </button>
            <button onClick={onRequestQuote} className="rounded-full border border-ink/25 bg-surface/60 px-7 py-3.5 text-sm font-semibold backdrop-blur transition hover:border-primary hover:text-primary">
              Request a Quote
            </button>
          </div>

          <dl style={delay(4)} className="animate-fade-up mt-10 flex divide-x divide-line">
            {STATS.map((s) => (
              <div key={s.key} className="px-6 first:pl-0">
                <dd className="text-xl font-semibold">{s.value}</dd>
                <dt className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
