import { useState } from 'react';
import { Icon } from '../ui';
import QuoteCart from './QuoteCart';
import QuoteDetails from './QuoteDetails';
import { QUOTE_PAGE } from '../../data/content';
import { formatDate } from '../../utils/format';

function Steps({ step }) {
  return (
    <ol className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
      {QUOTE_PAGE.steps.map((label, i) => (
        <li key={label} className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-muted'}`}>
          {i > 0 && <span className="h-px w-6 bg-line sm:w-10" />}
          <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${i <= step ? 'bg-primary text-white' : 'bg-surface-2'}`}>
            {i < step ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}

/** Two-step quote: 1) cart — choose the brand, adjust quantities, add more or proceed; 2) enter validated details and send. */
export default function QuotePage({ quote, savedCount, onSaveQuotation, onBack, onSetQuantity, onSetBrand, onSetItemBrand, onRemove, onCompare, onClear }) {
  const [step, setStep] = useState(0);
  const goTo = (s) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-[calc(var(--header-h)+1.5rem)] sm:pb-14">
      <button onClick={step ? () => goTo(0) : onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-primary">
        <Icon name="arrow" className="h-4 w-4 rotate-180" /> {step ? 'Back to your quote' : 'Back to shop'}
      </button>

      {/* title + steps (the brand for all items is chosen next to "Your items") */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{QUOTE_PAGE.title}</h1>
            <p className="mt-1 text-xs text-ink/70">
              {formatDate()} · your Quotation ID is given when you send ·{' '}
              <a href="/track" className="font-semibold text-primary hover:underline">
                Track an earlier quotation
              </a>
            </p>
          </div>
          <Steps step={step} />
        </div>
      </div>

      {step === 0 ? (
        <QuoteCart
          quote={quote}
          savedCount={savedCount}
          onSaveQuotation={onSaveQuotation}
          onSetBrand={onSetBrand}
          onSetItemBrand={onSetItemBrand}
          onSetQuantity={onSetQuantity}
          onRemove={onRemove}
          onProceed={() => goTo(1)}
          onCompare={onCompare}
          onClear={onClear}
        />
      ) : (
        <QuoteDetails quote={quote} onEdit={() => goTo(0)} onSetItemBrand={onSetItemBrand} onSetQuantity={onSetQuantity} onRemove={onRemove} />
      )}
    </main>
  );
}
