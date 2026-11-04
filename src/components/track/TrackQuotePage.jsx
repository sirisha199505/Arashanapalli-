import { useEffect, useState } from 'react';
import { COMPANY } from '../../data/catalog';
import usePageMeta from '../../hooks/usePageMeta';
import { navigate } from '../../hooks/useRoute';
import { quotationPdfUrl, trackQuotation, upiQrUrl } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { sharePdf, whatsAppUrl } from '../../utils/share';
import { customerStatusOf } from '../../utils/quoteStatus';
import VersionCompare from '../compare/VersionCompare';
import Page from '../layout/Page';
import { Badge, Button, Card, EmptyState, Icon } from '../ui';

const date = (value) => formatDate(new Date(value));

/** /track and /track/<Quotation ID>: a customer looks up a quotation by its ID (the only way customers can find one). */
export default function TrackQuotePage({ quotationId }) {
  usePageMeta({ title: quotationId ? `Quotation ${quotationId}` : 'Track your quotation', description: `Look up your ${COMPANY.name} quotation by its Quotation ID.` });
  const [input, setInput] = useState(quotationId ?? '');
  const [state, setState] = useState({ loading: Boolean(quotationId), quote: null, error: null });

  useEffect(() => {
    setInput(quotationId ?? '');
    if (!quotationId) {
      setState({ loading: false, quote: null, error: null });
      return undefined;
    }
    let current = true;
    setState({ loading: true, quote: null, error: null });
    trackQuotation(quotationId)
      .then((quote) => current && setState({ loading: false, quote, error: null }))
      .catch((error) => current && setState({ loading: false, quote: null, error }));
    return () => {
      current = false;
    };
  }, [quotationId]);

  const { quote, loading, error } = state;
  const status = quote && customerStatusOf(quote);

  return (
    <Page eyebrow="Quotations" title="Track your quotation" subtitle="Enter the Quotation ID from your WhatsApp or email message, e.g. AT-2611-7K3P9">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) navigate(`/track/${input.trim().toUpperCase()}`);
        }}
        className="mb-6 flex max-w-xl gap-2 print:hidden"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Quotation ID"
          aria-label="Quotation ID"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 font-mono text-sm uppercase tracking-wide outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit">Find</Button>
      </form>

      <p className="-mt-3 mb-6 text-sm text-muted print:hidden">
        Gave us your email?{' '}
        <a href="/account" className="font-semibold text-primary hover:underline">
          Sign in to see all your quotations
        </a>
      </p>
      {loading && <p className="text-sm text-muted">Looking up {quotationId}…</p>}
      {error && (
        <Card>
          <EmptyState
            title="Quotation not found"
            message={`We couldn't find ${quotationId}. Check the ID in your message — or ask us on WhatsApp.`}
            action={
              <Button as="a" href={whatsAppUrl(`Hi, I can't find my quotation ${quotationId}.`)} target="_blank" rel="noreferrer" variant="whatsapp">
                Ask on WhatsApp
              </Button>
            }
          />
        </Card>
      )}

      {quote && (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="text-xs text-muted">Quotation ID</p>
              <p className="font-mono text-xl font-bold tracking-wide">{quote.quote_number}</p>
              <p className="mt-1 text-sm text-muted">
                {date(quote.created_at)} · valid until {date(quote.valid_until)}
              </p>
            </div>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>

          <div className="grid gap-1 border-b border-line py-4 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted">Customer: </span>
              {quote.customer_name} · {quote.customer_phone}
              {quote.customer_city && ` · ${quote.customer_city}`}
            </p>
            {quote.company_name && (
              <p>
                <span className="text-muted">Company: </span>
                {quote.company_name}
                {quote.gstin && ` · GSTIN ${quote.gstin}`}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="py-2 font-medium">Item code</th>
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Brand</th>
                  <th className="py-2 text-right font-medium">Qty</th>
                  <th className="py-2 text-right font-medium">Rate</th>
                  <th className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {quote.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 font-mono text-xs font-semibold">{item.dynamic_code ?? item.product_code}</td>
                    <td className="py-2">
                      {item.product_name}
                      {(item.warranty || item.benefits) && (
                        <span className="block text-xs text-muted">{[item.warranty && `Warranty ${item.warranty}`, item.benefits].filter(Boolean).join(' · ')}</span>
                      )}
                      {item.alternatives?.length > 0 && (
                        <span className="block text-xs text-muted">
                          Also available: {item.alternatives.map((a) => `${a.brand_name} ${formatCurrency(a.unit_price)}`).join(' · ')}
                        </span>
                      )}
                    </td>
                    <td className="py-2">{item.brand_name ?? '—'}</td>
                    <td className="py-2 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 text-right">{item.unit_price ? formatCurrency(item.unit_price) : 'On request'}</td>
                    <td className="py-2 text-right font-semibold">{item.amount ? formatCurrency(item.amount) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="ml-auto mt-4 w-full max-w-xs space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatCurrency(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">GST (18%)</dt>
              <dd>{formatCurrency(quote.gst)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{formatCurrency(quote.total)}</dd>
            </div>
          </dl>

          {quote.payment && (
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-line p-4">
              <img src={upiQrUrl(quote.quote_number)} alt={`UPI QR code to pay ${formatCurrency(quote.total)}`} width="128" height="128" className="h-32 w-32" />
              <div className="min-w-0 text-sm">
                <p className="font-bold">Scan to pay by UPI</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(quote.total)} · Quotation {quote.quote_number}
                </p>
                <p className="mt-1">UPI ID: <span className="font-mono">{quote.payment.upi_id}</span></p>
                <p className="mt-1 text-xs text-muted">GPay, PhonePe, Paytm or any UPI app — the amount and quotation ID fill in by themselves.</p>
                <a href={quote.payment.link} className="mt-2 inline-block text-xs font-semibold text-primary hover:underline sm:hidden">
                  Pay with a UPI app on this phone
                </a>
              </div>
            </div>
          )}

          {quote.versions.length > 1 && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Versions of this quotation</p>
              <div className="flex flex-wrap gap-2">
                {quote.versions.map((v) => (
                  <a
                    key={v.quote_number}
                    href={`/track/${v.quote_number}`}
                    aria-current={v.quote_number === quote.quote_number ? 'page' : undefined}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ${v.quote_number === quote.quote_number ? 'bg-primary text-white ring-primary' : 'ring-line hover:ring-primary'}`}
                  >
                    <span className="font-mono">{v.quote_number}</span> · {formatCurrency(v.total)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 print:hidden">
            <Button as="a" href={whatsAppUrl(`Hi, about my quotation ${quote.quote_number}:`)} target="_blank" rel="noreferrer" variant="whatsapp">
              <Icon name="chat" className="h-4 w-4" /> Ask about this quotation
            </Button>
            <Button as="a" variant="secondary" href={quotationPdfUrl(quote.quote_number)} target="_blank" rel="noreferrer">
              <Icon name="file" className="h-4 w-4" /> Download PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => sharePdf({ url: quotationPdfUrl(quote.quote_number), filename: `${quote.quote_number}.pdf`, text: `My quotation ${quote.quote_number} from ${COMPANY.name}` })}
            >
              Share
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted">Prices include 18% GST and are valid until {date(quote.valid_until)}. Final rates are confirmed when you order.</p>
        </Card>
      )}

      {quote?.versions.length > 1 && (
        <Card className="mt-6 p-5 print:hidden">
          <VersionCompare key={quote.quote_number} versions={quote.versions} shareText={(ids) => `Comparison of my quotations ${ids.join(', ')} from ${COMPANY.name}`} />
        </Card>
      )}
    </Page>
  );
}
