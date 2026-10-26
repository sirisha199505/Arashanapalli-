import { useState } from 'react';
import { Button, Card, Icon } from '../ui';
import CategoryQuoteSection from './CategoryQuoteSection';
import CustomerForm from './CustomerForm';
import TotalsSummary from './TotalsSummary';
import { QUOTE_PAGE } from '../../data/content';
import { formatCurrency, formatDate } from '../../utils/format';
import { quoteNumber } from '../../utils/quote';
import { buildMailtoLink, buildWhatsAppLink, isCustomerValid } from '../../utils/share';

const EMPTY_CUSTOMER = { name: '', phone: '', city: '' };

/** Full-page combined quote: door hardware + furniture accessories in one quote, one total, one send. */
export default function QuotePage({ quote, onBack, onAddProduct, onQuantityChange, onRemove, onClear, onCompare }) {
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const hasLines = quote.lines.length > 0;
  const canSend = hasLines && isCustomerValid(customer);
  const sendProps = (href) => (canSend ? { href } : { 'aria-disabled': true });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-24 sm:pb-14 lg:pt-28">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary">
        <Icon name="arrow" className="h-4 w-4 rotate-180" /> Back to shop
      </button>

      <div className="mb-6">
        <p className="eyebrow">{QUOTE_PAGE.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">{QUOTE_PAGE.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{QUOTE_PAGE.subtitle}</p>
        <p className="mt-2 text-xs text-muted">
          Quote #{quoteNumber()} · {formatDate()}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-5">
          <Card className="border-primary/20 bg-primary/5 p-4">
            <p className="mb-3 text-sm font-semibold">Your details (needed to send the quote)</p>
            <CustomerForm customer={customer} onChange={setCustomer} />
          </Card>
          {quote.sections.map((section) => (
            <CategoryQuoteSection
              key={section.category}
              section={section}
              onAddProduct={onAddProduct}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))}
        </div>

        <Card as="aside" className="p-4 sm:p-5 lg:sticky lg:top-24">
          <h2 className="mb-3 text-lg font-bold">Quote Summary</h2>
          <dl className="mb-3 space-y-1 border-b border-line pb-3 text-sm">
            {quote.sections.map((s) => (
              <div key={s.category} className="flex justify-between">
                <dt>
                  {s.category} <span className="text-muted">({s.lines.length})</span>
                </dt>
                <dd className="font-semibold">{formatCurrency(s.subtotal)}</dd>
              </div>
            ))}
          </dl>
          <TotalsSummary totals={quote.totals} />

          <div className="mt-4 grid gap-2">
            <Button as="a" variant="whatsapp" target="_blank" rel="noreferrer" {...sendProps(buildWhatsAppLink(quote, customer))}>
              <Icon name="chat" className="h-4 w-4" /> Send on WhatsApp
            </Button>
            <Button as="a" variant="secondary" {...sendProps(buildMailtoLink(quote, customer))}>
              Email Quote
            </Button>
            {hasLines && (
              <>
                <Button variant="secondary" onClick={onCompare}>
                  Compare these products by brand
                </Button>
                <Button variant="danger" onClick={onClear}>
                  Clear quote
                </Button>
              </>
            )}
          </div>
          {!canSend && (
            <p className="mt-3 text-xs text-muted">
              {hasLines ? 'Enter your name and phone number to send.' : 'Add at least one product to send a quote.'}
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
