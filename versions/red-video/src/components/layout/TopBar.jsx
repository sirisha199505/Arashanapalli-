import { COMPANY } from '../../data/catalog';
import { TOP_BAR } from '../../data/content';
import { INSTAGRAM_URL } from '../../data/instagram';
import { phoneUrl } from '../../utils/share';
import { Icon } from '../ui';

const link = 'flex items-center gap-1.5 transition hover:text-white';

/** Thin dark strip above the header (desktop only). */
export default function TopBar() {
  return (
    <div className="hidden bg-dark text-xs text-white/70 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <ul className="flex items-center gap-3">
          {TOP_BAR.points.map((p, i) => (
            <li key={p} className="flex items-center gap-3">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-primary" />}
              {p}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-5">
          <a href={COMPANY.googleListing} target="_blank" rel="noreferrer" className={link}>
            <Icon name="pin" className="h-3.5 w-3.5" /> {COMPANY.area}
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={link}>
            <Icon name="instagram" className="h-3.5 w-3.5" /> Instagram
          </a>
          <a href={phoneUrl()} className={`${link} font-semibold text-white`}>
            <Icon name="phone" className="h-3.5 w-3.5" /> {COMPANY.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
