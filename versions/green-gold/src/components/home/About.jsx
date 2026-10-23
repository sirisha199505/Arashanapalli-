import { ABOUT } from '../../data/content';
import { Button, Icon } from '../ui';

/** Image, story and a checklist card. */
export default function About({ onLearnMore }) {
  return (
    <section id="about" className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1.1fr_1.2fr_0.9fr]">
      <img src={ABOUT.image} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover shadow-xl lg:aspect-[4/5]" />
      <div>
        <p className="eyebrow">{ABOUT.eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{ABOUT.title}</h2>
        <p className="mt-5 leading-relaxed text-muted">{ABOUT.text}</p>
        <Button className="mt-7" onClick={onLearnMore}>
          Learn More <Icon name="arrow" className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-4 rounded-xl border border-line bg-surface p-6 shadow-sm">
        {ABOUT.points.map((p) => (
          <li key={p.text} className="flex items-center gap-3 text-sm">
            <Icon name={p.icon} className="h-5 w-5 text-primary" />
            {p.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
