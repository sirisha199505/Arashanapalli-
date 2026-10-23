import StoryRing from './StoryRing';

/** Horizontal row of story highlights. */
export default function StoriesRow({ groups, seen, onOpen }) {
  return (
    <section aria-label="Stories" className="mx-auto max-w-7xl px-4 pt-8">
      {/* centred when it fits, scrolls sideways when it doesn't */}
      <div className="overflow-x-auto pb-2 [scrollbar-width:none]">
        <ul className="mx-auto flex w-max gap-5 px-1 sm:gap-8">
          {groups.map((g, i) => (
            <li key={g.id}>
              <StoryRing image={g.cover} title={g.title} seen={seen.has(g.id)} size="h-16 w-16 sm:h-20 sm:w-20" onClick={() => onOpen(i)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
