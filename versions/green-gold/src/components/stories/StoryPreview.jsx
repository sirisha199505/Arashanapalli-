import StoryRing from './StoryRing';

/** Dimmed neighbouring story shown beside the viewer on large screens (click to jump). */
export default function StoryPreview({ group, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative hidden aspect-[9/16] h-[45vh] shrink-0 overflow-hidden rounded-xl opacity-60 transition hover:opacity-90 xl:block"
      aria-label={`Go to ${group.title}`}
    >
      <img src={group.slides[0].image} alt="" className="absolute inset-0 h-full w-full object-cover blur-[2px] brightness-50" />
      <span className="relative grid h-full place-items-center text-white">
        <StoryRing image={group.cover} title={group.title} size="h-16 w-16" />
      </span>
    </button>
  );
}
