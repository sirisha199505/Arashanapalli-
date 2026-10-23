import { INTERIOR_LINES } from '../../data/catalog';
import { SECTIONS } from '../../data/content';
import { getCategorySummaries } from '../../utils/catalog';
import { whatsAppUrl } from '../../utils/share';
import { Button, Card, Icon, IconTile, Section } from '../ui';

const CATEGORIES = getCategorySummaries();

export default function CategorySection({ onPickCategory }) {
  return (
    <Section id="categories">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight md:text-3xl">{SECTIONS.categories.title}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <li key={c.name}>
                <Card as="button" interactive onClick={() => onPickCategory(c.name)} className="flex w-full items-center gap-3 p-4 text-left">
                  <IconTile name={c.icon} />
                  <span>
                    <span className="block text-sm font-bold">{c.name}</span>
                    <span className="text-xs text-muted">{c.count} products</span>
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight md:text-3xl">{SECTIONS.interiors.title}</h2>
          <Card className="p-5">
            <p className="text-sm text-muted">{SECTIONS.interiors.text}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {INTERIOR_LINES.map((line) => (
                <li key={line} className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-medium">
                  <Icon name="layers" className="h-4 w-4 text-primary" /> {line}
                </li>
              ))}
            </ul>
            <Button as="a" href={whatsAppUrl(`Hi, I'd like details on your interior products (${INTERIOR_LINES.join(', ')}).`)} target="_blank" rel="noreferrer" variant="whatsapp" className="mt-5 w-full">
              <Icon name="chat" /> Enquire on WhatsApp
            </Button>
          </Card>
        </div>
      </div>
    </Section>
  );
}
