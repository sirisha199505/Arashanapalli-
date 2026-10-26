import { Button, Icon } from '../ui';

/** Floating bar shown while products are picked for comparison. Sits above the mobile nav on phones. */
export default function CompareBar({ count, onCompare, onClear }) {
  if (!count) return null;
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 px-4 sm:bottom-5">
      <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-2xl">
        <p className="flex-1 text-sm font-semibold">
          {count} product{count === 1 ? '' : 's'} selected
        </p>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button size="sm" onClick={onCompare}>
          Compare brands <Icon name="arrow" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
