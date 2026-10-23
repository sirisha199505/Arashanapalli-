import { useRef } from 'react';
import { COLLECTIONS } from '../../data/content';
import { whatsAppUrl } from '../../utils/share';
import { Icon } from '../ui';

/** Product range: intro on the left, horizontally scrolling category cards on the right. */
export default function Collections({ onPickCategory, onViewAll }) {
  const rail = useRef(null);
  const scroll = () => rail.current?.scrollBy({ left: rail.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section id="collections" className="mx-auto grid max-w-7xl scroll-mt-24 gap-8 px-4 py-10 lg:grid-cols-[18rem_1fr] lg:items-center lg:py-14">
      <div>
        <h2 className="text-3xl font-light leading-tight tracking-tight md:text-4xl">{COLLECTIONS.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">{COLLECTIONS.text}</p>
        <button onClick={onViewAll} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
          View All Products <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>

      <div className="relative min-w-0">
        <ul ref={rail} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {COLLECTIONS.items.map((item) => {
            const { as: Tag, ...props } = item.category
              ? { as: 'button', onClick: () => onPickCategory(item.category) }
              : { as: 'a', href: whatsAppUrl(`Hi, I'd like details and prices for ${item.enquire}.`), target: '_blank', rel: 'noreferrer' };
            return (
              <li key={item.title} className="w-56 shrink-0 snap-start sm:w-60">
                <Tag {...props} className="group block w-full text-left">
                  <span className="block aspect-[4/3] overflow-hidden rounded-lg bg-surface-2">
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className={`h-full w-full transition duration-500 group-hover:scale-105 ${item.contain ? 'bg-white object-contain p-3 mix-blend-multiply' : 'object-cover'}`}
                    />
                  </span>
                  <span className="mt-3 block font-semibold">{item.title}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {item.category ? 'Explore' : 'Enquire'} <Icon name="arrow" className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </Tag>
              </li>
            );
          })}
        </ul>
        <button
          onClick={scroll}
          aria-label="More categories"
          className="absolute -right-2 top-[30%] hidden h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-lg transition hover:border-primary hover:text-primary md:grid"
        >
          <Icon name="chevronRight" />
        </button>
      </div>
    </section>
  );
}
