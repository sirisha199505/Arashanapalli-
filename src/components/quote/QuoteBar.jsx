import { Icon } from '../ui';

/**
 * Shown while shopping once something is selected: how many products, and Proceed to the quote.
 * `phoneHidden`: not on phones (the product page has its own bottom bar there; the Quotes tab shows the count).
 */
export default function QuoteBar({ count, onProceed, phoneHidden = false }) {
  return (
    <div className={`fixed inset-x-0 bottom-16 z-30 px-4 sm:bottom-5 ${phoneHidden ? 'hidden sm:block' : ''}`}>
      <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-dark p-3 pl-4 text-white shadow-2xl">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10">
          <Icon name="file" className="h-5 w-5" />
        </span>
        <p className="flex-1 text-sm">
          <span className="font-semibold">
            {count} product{count === 1 ? '' : 's'} selected
          </span>
          <span className="hidden text-white/70 sm:inline"> · choose brands and send on the next page</span>
        </p>
        <button onClick={onProceed} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold hover:bg-primary-hover">
          Proceed to quote <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
