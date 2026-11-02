import { Section } from '../ui';

/** A full page below the fixed header, with the standard heading. `wide` lets content run edge to edge. */
export default function Page({ eyebrow, title, subtitle, wide = false, children }) {
  return (
    <main className="pb-24 pt-[calc(var(--header-h)+0.5rem)] sm:pb-6">
      <Section eyebrow={eyebrow} title={title} subtitle={subtitle} className={wide ? 'pb-0 md:pb-0' : ''}>
        {!wide && children}
      </Section>
      {wide && children}
    </main>
  );
}
