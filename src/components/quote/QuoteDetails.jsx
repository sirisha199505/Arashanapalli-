import { useState } from 'react';
import { Button, Card, EmptyState, Icon } from '../ui';
import CustomerForm, { CUSTOMER_FIELDS, EXTRA_FIELDS } from './CustomerForm';
import QuoteLineRow from './QuoteLineRow';
import TotalsSummary from './TotalsSummary';
import { submitQuote } from '../../utils/api';
import { getCategoryIcon } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import { buildMailtoLink, buildWhatsAppLink } from '../../utils/share';
import { navigate } from '../../hooks/useRoute';
import { validateCustomer } from '../../utils/validation';

const EMPTY_CUSTOMER = { name: '', phone: '', city: '', email: '', company: '', gstin: '' };
const FIELDS = [...CUSTOMER_FIELDS, ...EXTRA_FIELDS];
const ALL_SHOWN = Object.fromEntries(FIELDS.map((f) => [f.name, true]));

/** Step 2: review the chosen items, enter + validate name / mobile / city, then send. */
export default function QuoteDetails({ quote, onEdit, onSetItemBrand, onSetQuantity, onRemove }) {
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [shown, setShown] = useState({});
  const [sent, setSent] = useState(null); // { via, id } — id is null if the quotation couldn't be saved
  const [sending, setSending] = useState(false);
  const sentVia = sent?.via;
  const errors = validateCustomer(customer);
  const isValid = Object.keys(errors).length === 0;

  const { brands, allBranded, lines, sections, unavailable } = quote;
  const brandNames = brands.map((b) => b.name).join(', ');
  if (!lines.length || !allBranded) {
    return (
      <Card>
        <EmptyState
          title={lines.length ? 'Choose a brand first' : 'Your quote is empty'}
          message={lines.length ? 'Choose a brand for every item on the previous step.' : 'Add at least one product before entering your details.'}
          action={<Button onClick={onEdit}>{lines.length ? 'Choose brand' : 'Browse products'}</Button>}
        />
      </Card>
    );
  }

  // Save the quotation first so the message carries its Quotation ID; if saving fails the message still goes, with a dated reference.
  const send = async (via) => {
    if (!isValid) {
      setShown(ALL_SHOWN);
      const first = FIELDS.find((f) => errors[f.name]);
      document.getElementById(`customer-${first.name}`)?.focus();
      return;
    }
    if (sending) return;
    setSending(true);
    // open WhatsApp's tab now, while still inside the click, so phone pop-up blockers allow it; it's pointed at the message below
    const tab = via === 'whatsapp' ? window.open('', '_blank') : null;
    let id = null;
    try {
      id = (await submitQuote(quote, customer, via)).data.quote_number;
    } catch (err) {
      console.warn('Could not save the quotation.', err);
    }
    const url = via === 'whatsapp' ? buildWhatsAppLink(quote, customer, id) : buildMailtoLink(quote, customer, id);
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else if (via === 'whatsapp') window.open(url, '_blank', 'noopener');
    else window.location.href = url;
    setSent({ via, id });
    setSending(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-5">
        <Card as="section" className="border-primary/20 bg-primary/5 p-4 sm:p-5">
          <h2 className="text-lg font-bold">Your details</h2>
          <p className="mb-4 text-xs text-muted">All fields are required so we can send your quote and call you back.</p>
          <form noValidate onSubmit={(e) => (e.preventDefault(), send('whatsapp'))}>
            <CustomerForm
              customer={customer}
              errors={errors}
              shown={shown}
              onChange={(c) => {
                setCustomer(c);
                setSentVia(null);
              }}
              onBlur={(name) => setShown((s) => ({ ...s, [name]: true }))}
            />
          </form>
        </Card>

        <Card as="section" className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Review items ({lines.length})</h2>
              <p className="text-sm text-ink/70">
                {brands.length === 1 ? 'Brand' : 'Brands'}: <span className="font-semibold text-ink">{brandNames}</span>
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={onEdit}>
              Change
            </Button>
          </div>
          {sections.map((s) => (
            <div key={s.category} className="mt-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name={getCategoryIcon(s.category)} className="h-4 w-4 text-primary" />
                  {s.category}
                </p>
                <p className="text-sm font-bold">{formatCurrency(s.subtotal)}</p>
              </div>
              <ul className="divide-y divide-line">
                {s.lines
                  .filter((line) => line.available)
                  .map((line) => (
                    <QuoteLineRow key={line.key} line={line} onSetBrand={onSetItemBrand} onSetQuantity={onSetQuantity} onRemove={onRemove} />
                  ))}
              </ul>
            </div>
          ))}
          {unavailable.length > 0 && (
            <div className="mt-5 rounded-lg border border-line bg-surface-2 p-3">
              <p className="text-sm font-semibold">Not available in the chosen brand</p>
              <p className="mb-2 text-xs text-ink/70">Choose another brand for these, or we’ll include them in your request and suggest the closest option.</p>
              <ul className="divide-y divide-line">
                {unavailable.map((line) => (
                  <QuoteLineRow key={line.key} line={line} onSetBrand={onSetItemBrand} onSetQuantity={onSetQuantity} onRemove={onRemove} />
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <Card as="aside" className="p-4 sm:p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">Quote Summary</h2>
        <p className="mb-3 text-sm text-ink/70">{brandNames}</p>
        <TotalsSummary totals={quote.totals} />
        <div className="mt-4 grid gap-2">
          <Button variant="whatsapp" onClick={() => send('whatsapp')} disabled={sending}>
            <Icon name="chat" className="h-4 w-4" /> Send on WhatsApp
          </Button>
          <Button variant="secondary" onClick={() => send('email')} disabled={sending}>
            Email Quote
          </Button>
        </div>
        {sentVia ? (
          <div role="status" className="mt-3 space-y-2 rounded-lg bg-emerald-600/10 p-3 text-xs text-emerald-800">
            <p className="flex items-start gap-2">
              <Icon name="check" className="h-4 w-4 shrink-0" />
              {sentVia === 'whatsapp' ? 'WhatsApp opened with your quote — press send there to finish.' : 'Your email app opened with the quote — press send there to finish.'}
            </p>
            {sent.id && (
              <div className="rounded-md bg-surface p-2.5 text-ink">
                <p className="text-[11px] text-muted">Your Quotation ID — keep it to see this quote again</p>
                <p className="font-mono text-base font-bold tracking-wide">{sent.id}</p>
                <button type="button" onClick={() => navigate(`/track/${sent.id}`)} className="mt-1 text-sm font-semibold text-primary hover:underline">
                  View / track this quotation →
                </button>
              </div>
            )}
          </div>
        ) : (
          !isValid && Object.keys(shown).length > 0 && (
            <p className="mt-3 text-xs font-medium text-primary">Please correct the highlighted details above.</p>
          )
        )}
      </Card>
    </div>
  );
}
