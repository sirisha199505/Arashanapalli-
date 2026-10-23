import { FEATURES } from '../../data/content';
import { Card, IconTile } from '../ui';

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {FEATURES.map((f) => (
          <Card as="li" key={f.title} className="flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:text-left">
            <IconTile name={f.icon} />
            <div>
              <p className="text-sm font-bold">{f.title}</p>
              <p className="text-xs text-muted">{f.text}</p>
            </div>
          </Card>
        ))}
      </ul>
    </section>
  );
}
