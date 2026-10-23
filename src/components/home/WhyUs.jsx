import { WHY_US } from '../../data/content';
import { Icon } from '../ui';

/** Four promises in a light band, separated by hairlines. */
export default function WhyUs() {
  return (
    <section className="border-y border-line bg-surface-2">
      <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line">
        {WHY_US.items.map((item) => (
          <li key={item.title} className="flex items-start gap-4 lg:px-6 lg:first:pl-0">
            <Icon name={item.icon} className="h-9 w-9 shrink-0 text-primary [stroke-width:1.5]" />
            <span>
              <span className="block font-semibold">{item.title}</span>
              <span className="mt-1 block text-sm text-muted">{item.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
