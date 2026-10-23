import { CTA } from '../../data/content';
import { phoneUrl, whatsAppUrl } from '../../utils/share';
import { Button, Icon } from '../ui';

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 text-center md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_0%,var(--glow),transparent)]" />
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tight md:text-4xl">{CTA.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{CTA.text}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as="a" href={phoneUrl()} size="lg">
              <Icon name="phone" /> Call Now
            </Button>
            <Button as="a" href={whatsAppUrl('Hi, I need help choosing hardware.')} target="_blank" rel="noreferrer" variant="secondary" size="lg">
              <Icon name="chat" /> WhatsApp Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
