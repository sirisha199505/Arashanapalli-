import { COLLECTIONS } from '../../data/content';
import { whatsAppUrl } from '../../utils/share';
import { Icon, Section } from '../ui';

/** Category cards: image on top, title and a round arrow. Filters products or enquires on WhatsApp. */
export default function Collections({ onPickCategory }) {
  return (
    <Section id="collections" eyebrow={COLLECTIONS.eyebrow} title={COLLECTIONS.title}>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {COLLECTIONS.items.map((item) => {
          const action = item.category
            ? { as: 'button', onClick: () => onPickCategory(item.category) }
            : { as: 'a', href: whatsAppUrl(`Hi, I'd like details and prices for ${item.enquire}.`), target: '_blank', rel: 'noreferrer' };
          const { as: Tag, ...props } = action;
          return (
            <li key={item.title}>
              <Tag {...props} className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-surface text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <span className="block aspect-[4/3] overflow-hidden bg-surface-2">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className={`h-full w-full transition duration-500 group-hover:scale-105 ${item.contain ? 'bg-white object-contain p-3 mix-blend-multiply' : 'object-cover'}`}
                  />
                </span>
                <span className="flex flex-1 items-center justify-between gap-3 p-4">
                  <span>
                    <span className="block font-display text-[17px] font-semibold leading-tight">{item.title}</span>
                    <span className="mt-1 block text-xs text-muted">{item.text}</span>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full max-sm:hidden bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon name="arrow" className="h-4 w-4" />
                  </span>
                </span>
              </Tag>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
