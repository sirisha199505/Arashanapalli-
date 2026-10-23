import { COMPANY, REVIEWS } from '../../data/catalog';
import { Button, Card, EmptyState } from '../ui';

export default function Reviews() {
  if (!REVIEWS.length) {
    return (
      <Card>
        <EmptyState
          title="No reviews yet"
          message="Reviews from our customers will appear here."
          action={
            <Button as="a" href={COMPANY.googleListing} target="_blank" rel="noreferrer" variant="secondary">
              See us on Google
            </Button>
          }
        />
      </Card>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {REVIEWS.map((r) => (
        <Card as="li" key={r.id} className="p-5">
          <p className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
          <p className="mt-2 text-sm">{r.text}</p>
          <p className="mt-3 text-xs font-semibold text-muted">— {r.author}</p>
        </Card>
      ))}
    </ul>
  );
}
