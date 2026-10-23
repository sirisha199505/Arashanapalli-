import { SPACES } from '../../data/content';
import { Section } from '../ui';

/** Full-bleed photo cards with a green fade and serif caption. */
export default function Spaces() {
  return (
    <Section eyebrow={SPACES.eyebrow} title={SPACES.title}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SPACES.items.map((item) => (
          <li key={item.title} className="group relative aspect-[4/5] overflow-hidden rounded-xl">
            <img src={item.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-white/75">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
