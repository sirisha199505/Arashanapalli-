import { useState } from 'react';
import { HERO } from '../../data/content';
import { getStats } from '../../utils/catalog';
import { Button, Icon } from '../ui';
import StoryProgress from '../stories/StoryProgress';

const STATS = getStats();
const SLIDE_MS = 6000;

/** Staggered entrance delay for the i-th hero element. */
const delay = (i) => ({ animationDelay: `${100 + i * 110}ms` });

function HeroSlides({ slides, index }) {
  return slides.map((s, i) => (
    <img
      key={s.id}
      src={s.image}
      alt={i === index ? s.title : ''}
      loading={i === 0 ? 'eager' : 'lazy'}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${i === index ? 'animate-kenburns opacity-100' : 'opacity-0'}`}
    />
  ));
}

function HeroPoints() {
  return (
    <ul className="space-y-5 rounded-2xl border border-white/15 bg-dark/60 p-6 text-white shadow-2xl backdrop-blur-md">
      {HERO.points.map((p) => (
        <li key={p.title} className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
            <Icon name={p.icon} className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">{p.title}</span>
            <span className="text-xs text-white/70">{p.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Full-width hero: text on the left, cross-fading photo slideshow on the right. */
export default function Hero({ slides, onExplore, onWatchStory, onOpenSlide }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  return (
    <section id="top" className="relative isolate overflow-hidden bg-brand text-white">
      {/* soft gold glow + fine grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_40%,rgba(183,131,63,0.22),transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-10 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div className="max-w-xl">
          <p className="eyebrow animate-fade-up" style={delay(0)}>
            {HERO.eyebrow}
          </p>
          <h1 style={delay(1)} className="animate-fade-up mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
            {HERO.title} <span className="block text-primary">{HERO.highlight}</span>
          </h1>
          <p style={delay(2)} className="animate-fade-up mt-6 text-base leading-relaxed text-white/75 md:text-lg">
            {HERO.subtitle}
          </p>

          <div style={delay(3)} className="animate-fade-up mt-9 flex flex-wrap items-center gap-6">
            <Button size="lg" onClick={onExplore}>
              Explore Products <Icon name="arrow" className="h-4 w-4" />
            </Button>
            <button onClick={onWatchStory} className="group flex items-center gap-3 text-sm font-semibold">
              <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-white/80 transition group-hover:border-primary group-hover:text-primary">
                <Icon name="play" className="ml-0.5 h-4 w-4" />
              </span>
              Watch Our Story
            </button>
          </div>

          <dl style={delay(4)} className="animate-fade-up mt-12 flex divide-x divide-white/15">
            {STATS.map((s) => (
              <div key={s.key} className="px-6 first:pl-0">
                <dd className="text-3xl font-semibold tracking-tight">{s.value}</dd>
                <dt className="mt-1 text-xs font-medium text-white/60">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* framed slideshow (kept at the photos' native size so they stay sharp) */}
        <div style={delay(2)} className="animate-fade-up relative order-first mx-auto w-full max-w-md lg:order-none lg:mr-0">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/15 sm:aspect-[4/5]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <HeroSlides slides={slides.slides} index={index} />
            <button onClick={() => onOpenSlide(index)} className="absolute inset-0" aria-label={`View ${slides.slides[index].title}`} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 right-4 w-36">
              <StoryProgress
                count={slides.slides.length}
                active={index}
                paused={paused}
                duration={SLIDE_MS}
                animationKey={`hero-${index}`}
                onDone={() => setIndex((i) => (i + 1) % slides.slides.length)}
              />
            </div>
          </div>
          <div className="absolute -bottom-8 -left-20 hidden w-72 xl:block">
            <HeroPoints />
          </div>
        </div>
      </div>
    </section>
  );
}
