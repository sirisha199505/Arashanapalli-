import { CTA } from '../../data/content';
import { phoneUrl, whatsAppUrl } from '../../utils/share';
import { Button, Icon } from '../ui';

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-12 text-white md:px-12 md:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{CTA.title}</h2>
            <p className="mt-3 text-white/75">{CTA.text}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button as="a" href={phoneUrl()} size="lg">
              <Icon name="phone" className="h-4 w-4" /> Call Now
            </Button>
            <Button as="a" href={whatsAppUrl('Hi, I need help choosing hardware.')} target="_blank" rel="noreferrer" variant="light" size="lg">
              <Icon name="chat" className="h-4 w-4" /> WhatsApp Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
