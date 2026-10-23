import { Badge, Button, Card, Icon } from '../ui';
import QuoteLineRow from './QuoteLineRow';
import TotalsSummary from './TotalsSummary';
import { quoteNumber } from '../../utils/quote';
import { buildMailtoLink, buildWhatsAppLink } from '../../utils/share';

/** One separate quote for one brand. */
export default function BrandQuoteCard({ quote, customer, canSend, onQuantityChange, onRemove, onClear }) {
  const { brand, lines, totals } = quote;
  const sendProps = (href) => (canSend ? { href } : { 'aria-disabled': true });
  return (
    <Card as="section" className="p-4">
      <header className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{brand.name}</h3>
          <p className="text-xs text-muted">Quote #{quoteNumber(brand.id)}</p>
        </div>
        <Badge tone={brand.tier}>{brand.tier}</Badge>
      </header>

      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <QuoteLineRow key={line.key} line={line} onQuantityChange={onQuantityChange} onRemove={onRemove} />
        ))}
      </ul>

      <div className="mt-3 rounded-xl bg-surface-2 p-3">
        <TotalsSummary totals={totals} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button as="a" variant="whatsapp" target="_blank" rel="noreferrer" {...sendProps(buildWhatsAppLink(quote, customer))}>
          <Icon name="chat" className="h-4 w-4" /> Send on WhatsApp
        </Button>
        <Button as="a" variant="secondary" {...sendProps(buildMailtoLink(quote, customer))}>
          Email Quote
        </Button>
        <Button variant="danger" className="ml-auto" onClick={() => onClear(brand.id)}>
          Clear
        </Button>
      </div>
    </Card>
  );
}
