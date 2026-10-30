import { Card, Icon } from '../components/ui';

/** One dashboard figure: label, big value, optional small line under it, and an icon tile. */
export default function StatCard({ label, value, sub, icon, onClick }) {
  const body = (
    <Card className={`flex h-full items-start justify-between gap-4 p-5 ${onClick ? 'transition hover:border-primary/50' : ''}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
        {sub && <p className="mt-2 text-xs text-muted">{sub}</p>}
      </div>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
        <Icon name={icon} className="h-6 w-6" />
      </span>
    </Card>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {body}
    </button>
  ) : (
    body
  );
}
