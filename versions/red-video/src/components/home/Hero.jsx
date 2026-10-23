import { HERO } from '../../data/content';
import { getStats } from '../../utils/catalog';
import { Button, Icon } from '../ui';

const STATS = getStats();

/** Staggered entrance delay for the i-th hero element. */
const delay = (i) => ({ animationDelay: `${100 + i * 110}ms` });

/** Full-width hero: text on the left, looping featured reel on the right. */
export default function Hero({ reel, onExplore, onWatchStory, onOpenVideo }) {
  return (
    <section id="top" className="relative isolate flex overflow-hidden bg-brand text-white lg:h-[calc(100svh-6.3rem)] lg:min-h-[34rem]">
      {/* soft glow + fine grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_40%,var(--glow),transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-8 lg:h-full lg:grid-cols-2 lg:gap-12">
        <div className="max-w-xl">
          <p className="eyebrow animate-fade-up" style={delay(0)}>
            {HERO.eyebrow}
          </p>
          <h1 style={delay(1)} className="animate-fade-up mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
            {HERO.title} <span className="block text-accent">{HERO.highlight}</span>
          </h1>
          <p style={delay(2)} className="animate-fade-up mt-5 text-base leading-relaxed text-white/75 md:text-lg">
            {HERO.subtitle}
          </p>

          <div style={delay(3)} className="animate-fade-up mt-7 flex flex-wrap items-center gap-6">
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

          <dl style={delay(4)} className="animate-fade-up mt-9 flex divide-x divide-white/15">
            {STATS.map((s) => (
              <div key={s.key} className="px-6 first:pl-0">
                <dd className="text-3xl font-semibold tracking-tight">{s.value}</dd>
                <dt className="mt-1 text-xs font-medium text-white/60">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* framed reel: loops silently; click to watch with sound in the story viewer */}
        <div style={delay(2)} className="animate-fade-up relative order-first mx-auto w-full max-w-lg lg:order-none lg:h-full lg:max-w-none">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/40 ring-1 ring-white/15 sm:aspect-[4/5] lg:aspect-auto lg:h-full lg:w-full">
            <video
              src={reel.video}
              poster={reel.image}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            />
            <img src={reel.image} alt="" className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block" />
            <button onClick={onOpenVideo} className="absolute inset-0" aria-label={`Watch ${reel.title} with sound`} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
              <p className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-primary">
                  <Icon name="play" className="ml-0.5 h-3 w-3" />
                </span>
                Watch with sound
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
