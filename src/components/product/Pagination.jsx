import { Icon } from '../ui';

// page numbers to show: first, last, and two either side of the current one, with gaps as '…'
const pageList = (page, total) => {
  const pages = [...new Set([1, total, page - 2, page - 1, page, page + 1, page + 2])].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return pages.flatMap((n, i) => (i && n - pages[i - 1] > 1 ? ['…', n] : [n]));
};

const item = 'inline-flex h-9 min-w-9 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-sm font-semibold transition';

/** Amazon-style page numbers. `hrefFor(n)` gives each page's address, so pages are real links. */
export default function Pagination({ page, totalPages, hrefFor }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-center gap-1 pt-2">
      {page > 1 ? (
        <a href={hrefFor(page - 1)} className={`${item} gap-1 ring-1 ring-line hover:ring-primary`}>
          <Icon name="chevronLeft" className="h-4 w-4" /><span className="max-sm:sr-only">Previous</span>
        </a>
      ) : null}
      {pageList(page, totalPages).map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <a
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`${item} ${n === page ? 'bg-primary text-white' : 'ring-1 ring-line hover:ring-primary'}`}
          >
            {n}
          </a>
        ),
      )}
      {page < totalPages ? (
        <a href={hrefFor(page + 1)} className={`${item} gap-1 ring-1 ring-line hover:ring-primary`}>
          <span className="max-sm:sr-only">Next</span><Icon name="chevronRight" className="h-4 w-4" />
        </a>
      ) : null}
    </nav>
  );
}
