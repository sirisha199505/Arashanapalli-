import { useEffect, useState } from 'react';
import { comparisonPdfUrl, fetchQuotationComparison } from '../../utils/api';
import { formatCurrency } from '../../utils/format';
import { sharePdf } from '../../utils/share';
import { Button, Icon } from '../ui';
import ComparisonSummary from './ComparisonSummary';

const MAX = 3;

/**
 * Compare 2–3 versions of a quotation (same products, only brands / prices differ): pros and cons on price, benefits,
 * quality, savings and support from the prices actually quoted, plus a branded comparison PDF to download or share.
 * `phone` (staff only) sends the WhatsApp message straight to the customer.
 */
export default function VersionCompare({ versions, phone, shareText }) {
  // start with the latest versions
  const [picked, setPicked] = useState(() => versions.slice(-MAX).map((v) => v.quote_number));
  const [state, setState] = useState({ loading: false, results: null, error: null });
  const ids = versions.map((v) => v.quote_number).filter((n) => picked.includes(n));

  useEffect(() => {
    if (ids.length < 2) {
      setState({ loading: false, results: null, error: null });
      return undefined;
    }
    let current = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchQuotationComparison(ids)
      .then((data) => current && setState({ loading: false, error: null, results: data.map((r) => ({ quotation: { id: r.quote_number, name: r.quote_number }, criteria: r.criteria, badges: r.badges, itemCount: r.item_count })) }))
      .catch((error) => current && setState({ loading: false, results: null, error }));
    return () => {
      current = false;
    };
  }, [ids.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (n) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < MAX ? [...p, n] : p));
  const pdf = ids.length >= 2 ? comparisonPdfUrl(ids) : null;

  return (
    <section className="space-y-4" aria-label="Compare versions">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Compare quotations</span>
        <span className="text-xs text-muted">(up to {MAX}, same products — only brands / prices differ)</span>
        {versions.map((v) => (
          <label key={v.quote_number} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ${picked.includes(v.quote_number) ? 'bg-primary/10 ring-primary/40' : 'ring-line'}`}>
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-primary"
              checked={picked.includes(v.quote_number)}
              disabled={!picked.includes(v.quote_number) && picked.length >= MAX}
              onChange={() => toggle(v.quote_number)}
            />
            <span className="font-mono">{v.quote_number}</span> · {formatCurrency(v.total ?? 0)}
          </label>
        ))}
      </div>

      {pdf && !state.error && (
        <div className="flex flex-wrap gap-2">
          <Button as="a" href={pdf} target="_blank" rel="noreferrer" size="sm" variant="secondary">
            <Icon name="file" className="h-4 w-4" /> Comparison PDF
          </Button>
          <Button size="sm" variant="whatsapp" onClick={() => sharePdf({ url: pdf, filename: `Comparison-${ids[0]}.pdf`, text: shareText(ids), phone })}>
            <Icon name="chat" className="h-4 w-4" /> Share comparison on WhatsApp
          </Button>
        </div>
      )}

      {ids.length < 2 && <p className="text-sm text-muted">Tick at least 2 versions.</p>}
      {state.error && (
        <p role="alert" className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          {state.error.message}
        </p>
      )}
      {state.loading && !state.results && <p className="text-sm text-muted">Comparing…</p>}
      {state.results && (
        <div className={state.loading ? 'opacity-60' : ''}>
          <ComparisonSummary results={state.results} title="Versions" />
        </div>
      )}
    </section>
  );
}
