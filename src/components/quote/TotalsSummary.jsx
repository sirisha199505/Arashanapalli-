import { COMPANY } from '../../data/catalog';
import { formatCurrency } from '../../utils/format';

export default function TotalsSummary({ totals }) {
  const rows = [
    { label: 'Subtotal', value: totals.subtotal },
    { label: `GST (${COMPANY.gstRate * 100}%)`, value: totals.gst },
  ];
  return (
    <dl className="space-y-1 text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between text-muted">
          <dt>{r.label}</dt>
          <dd>{formatCurrency(r.value)}</dd>
        </div>
      ))}
      <div className="flex justify-between border-t border-line pt-2 text-base font-black">
        <dt>Total</dt>
        <dd>{formatCurrency(totals.total)}</dd>
      </div>
    </dl>
  );
}
