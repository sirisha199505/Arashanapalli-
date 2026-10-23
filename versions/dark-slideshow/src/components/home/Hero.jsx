import { BRANDS } from '../../data/catalog';
import { HERO } from '../../data/content';
import { shortBrandName } from '../../utils/catalog';
import { whatsAppUrl } from '../../utils/share';
import { Button, Icon } from '../ui';
import HeroBackdrop from './HeroBackdrop';
import HeroSlider from './HeroSlider';

/** Staggered entrance delay for the i-th hero element. */
const delay = (i) => ({ animationDelay: `${150 + i * 120}ms` });

export default function Hero({ onBrowse, slides, onOpenSlide }) {
  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-line">
      <HeroBackdrop />
      <div className="relative mx-auto grid min-h-[min(100svh,58rem)] max-w-7xl items-center gap-14 px-4 pb-24 pt-28 lg:grid-cols-[1.1fr_1fr] lg:pb-48 lg:pt-32">
        <div className="text-center lg:text-left">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur" style={delay(0)}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> {HERO.eyebrow}
          </span>

          <h1 style={delay(1)} className="animate-fade-up mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
            {HERO.title} <span className="text-shine block">{HERO.highlight}</span>
          </h1>

          <p style={delay(2)} className="animate-fade-up mx-auto mt-6 max-w-xl text-muted md:text-lg lg:mx-0">
            {HERO.subtitle}
          </p>

          <div style={delay(3)} className="animate-fade-up mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button size="lg" onClick={onBrowse}>
              Get a Quote <Icon name="arrow" className="h-4 w-4" />
            </Button>
            <Button as="a" href={whatsAppUrl('Hi, I would like a quote.')} target="_blank" rel="noreferrer" variant="secondary" size="lg">
              <Icon name="chat" className="h-4 w-4" /> WhatsApp Us
            </Button>
          </div>

          <div style={delay(4)} className="animate-fade-up mt-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Brands we stock</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
              {BRANDS.map((b) => (
                <li key={b.id} className="text-sm font-bold text-ink/60 transition hover:text-ink">
                  {shortBrandName(b)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={delay(3)} className="animate-fade-up">
          <HeroSlider group={slides} onOpen={onOpenSlide} />
        </div>
      </div>
    </section>
  );
}
