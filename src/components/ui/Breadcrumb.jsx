import { Fragment } from 'react';
import Icon from './Icon';

/**
 * The trail at the top of a page: [{ label, href }] — the last item is the current page (plain text, no link).
 * Pages build the trail from how the visitor got there, e.g. Home › Brands › Godrej › Safety Lockers when a
 * category is opened from a brand's page (?brand=godrej), and Home › Products › Safety Lockers otherwise.
 */
export default function Breadcrumb({ items, className = 'mb-3' }) {
  return (
    <nav aria-label="Breadcrumb" className={`${className} flex flex-wrap items-center gap-1 text-xs text-muted`}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={`${i}-${item.label}`}>
            {i > 0 && <Icon name="chevronRight" className="h-3 w-3 shrink-0" />}
            {last || !item.href ? (
              <span className={last ? 'truncate text-ink' : undefined} aria-current={last ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <a href={item.href} className="hover:text-primary">
                {item.label}
              </a>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
