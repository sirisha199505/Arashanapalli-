import { useState } from 'react';
import { Icon } from '../ui';

const SHOWN = 10; // categories / subcategories listed before "See more"

/**
 * Left-hand category list, the Amazon way: a plain list of links. With no category chosen it lists every category;
 * once one is chosen it shows "‹ Any Category", that category in bold and its subcategories indented under it; with a
 * subcategory chosen, "‹ Any Category", "‹ <category>" and the subcategory in bold.
 * Each category's arrow opens its subcategories in place. `hrefFor(category, subSlug)` builds the links.
 */
export default function CategoryTree({ tree, category, subcategory, hrefFor }) {
  const [open, setOpen] = useState(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const toggle = (c) =>
    setOpen((s) => {
      const next = new Set(s);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const link = 'block py-1 text-sm leading-snug text-ink hover:text-primary hover:underline';
  const current = category && tree.find((n) => n.category === category);

  if (current) {
    const chosen = subcategory && current.subcategories.find((x) => x.slug === subcategory);
    const back = 'flex items-center gap-0.5 py-1 text-sm text-ink hover:text-primary hover:underline';
    // like Amazon: "‹ Any Category", "‹ Plywood", then the chosen subcategory in bold
    if (chosen) {
      return (
        <nav aria-label="Categories" className="text-sm">
          <h2 className="mb-1.5 font-bold text-ink">Category</h2>
          <a href={hrefFor(null)} className={back}>
            <Icon name="chevronLeft" className="h-3 w-3" /> Any Category
          </a>
          <a href={hrefFor(category)} className={back}>
            <Icon name="chevronLeft" className="h-3 w-3" /> {category}
          </a>
          <p aria-current="page" className="py-1 pl-4 text-sm font-bold leading-snug text-ink">
            {chosen.name}
          </p>
        </nav>
      );
    }
    const subs = showAll ? current.subcategories : current.subcategories.slice(0, SHOWN);
    return (
      <nav aria-label="Categories" className="text-sm">
        <h2 className="mb-1.5 font-bold text-ink">Category</h2>
        <a href={hrefFor(null)} className={back}>
          <Icon name="chevronLeft" className="h-3 w-3" /> Any Category
        </a>
        <p aria-current="page" className="py-1 pl-4 text-sm font-bold leading-snug text-ink">
          {category}
        </p>
        <ul className="pl-7">
          {subs.map((s) => (
            <li key={s.slug}>
              <a href={hrefFor(category, s.slug)} className={link}>
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        <SeeMore count={current.subcategories.length} showAll={showAll} onToggle={() => setShowAll((v) => !v)} />
      </nav>
    );
  }

  const shown = showAll ? tree : tree.slice(0, SHOWN);
  return (
    <nav aria-label="Categories" className="text-sm">
      <h2 className="mb-1.5 font-bold text-ink">Category</h2>
      <ul>
        {shown.map(({ category: c, subcategories }) => {
          const expanded = open.has(c);
          return (
            <li key={c}>
              <div className="flex items-start justify-between gap-1">
                <a href={hrefFor(c)} className={link}>
                  {c}
                </a>
                {subcategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggle(c)}
                    aria-expanded={expanded}
                    aria-label={`${expanded ? 'Hide' : 'Show'} ${c} subcategories`}
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded text-muted hover:text-primary"
                  >
                    <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {expanded && (
                <ul className="pl-3">
                  {subcategories.map((s) => (
                    <li key={s.slug}>
                      <a href={hrefFor(c, s.slug)} className={link}>
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <SeeMore count={tree.length} showAll={showAll} onToggle={() => setShowAll((v) => !v)} />
    </nav>
  );
}

function SeeMore({ count, showAll, onToggle }) {
  if (count <= SHOWN) return null;
  return (
    <button type="button" onClick={onToggle} className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline">
      <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
      {showAll ? 'See less' : `See all ${count}`}
    </button>
  );
}
