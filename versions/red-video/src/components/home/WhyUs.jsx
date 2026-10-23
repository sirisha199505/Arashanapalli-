import { WHY_US } from '../../data/content';
import { Icon } from '../ui';

/** Light band: heading on the left, four promises on the right. */
export default function WhyUs() {
  return (
    <section className="border-y border-line bg-surface-2">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <p className="eyebrow">{WHY_US.eyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">{WHY_US.title}</h2>
        </div>
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {WHY_US.items.map((item) => (
            <li key={item.title} className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage/30 text-brand">
                <Icon name={item.icon} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="text-xs text-muted">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
