import { FAQS, SECTIONS } from '../../data/content';
import { Icon, Section } from '../ui';

/** Native <details> accordion — keyboard accessible with no state. */
export default function Faq() {
  return (
    <Section id="faq" {...SECTIONS.faq}>
      <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {FAQS.map((item) => (
          <details key={item.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {item.q}
              <Icon name="chevronDown" className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
