import { COMPANY, INTERIOR_LINES } from '../../data/catalog';
import { NAV_LINKS } from '../../data/content';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../data/instagram';
import { getCategories } from '../../utils/catalog';
import { phoneUrl } from '../../utils/share';
import { Icon, Logo } from '../ui';

const COLUMNS = [
  { title: 'Products', items: [...getCategories(), ...INTERIOR_LINES.slice(0, 3)].map((label) => ({ label, href: '#collections' })) },
  { title: 'Quick Links', items: NAV_LINKS },
];

const CONTACT = [
  { icon: 'phone', label: COMPANY.phone, href: phoneUrl() },
  { icon: 'pin', label: COMPANY.address, href: COMPANY.googleListing },
  { icon: 'instagram', label: `@${INSTAGRAM_HANDLE}`, href: INSTAGRAM_URL },
];

const linkClass = 'text-sm text-white/65 transition hover:text-primary';

export default function Footer() {
  return (
    <footer id="contact" className="mt-6 bg-dark pb-20 text-white sm:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-display text-xl font-semibold">{COMPANY.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">{COMPANY.about}</p>
          <p className="mt-3 text-xs text-white/50">{COMPANY.owner}</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-display text-lg font-semibold">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.items.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-4 font-display text-lg font-semibold">Contact</h3>
          <ul className="space-y-3">
            {CONTACT.map((c) => (
              <li key={c.icon}>
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={`flex gap-3 ${linkClass}`}>
                  <Icon name={c.icon} className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {COMPANY.name} · {COMPANY.tagline} · Prices are indicative and subject to confirmation.
      </div>
    </footer>
  );
}
