/** Instagram-style circular avatar: brand-gradient ring when unseen, grey when seen. */
export default function StoryRing({ image, title, seen = false, size = 'h-20 w-20', showLabel = true, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className="group flex w-max shrink-0 flex-col items-center gap-2" aria-label={onClick ? `Open ${title} story` : undefined}>
      <span
        className={`rounded-full p-[3px] transition group-hover:scale-105 ${
          seen ? 'bg-line' : 'bg-[conic-gradient(from_180deg,#f97316,var(--primary),#be185d,#f97316)]'
        }`}
      >
        <span className="block rounded-full bg-bg p-[3px]">
          <img src={image} alt="" className={`${size} rounded-full object-cover`} />
        </span>
      </span>
      {showLabel && <span className="max-w-20 truncate text-xs font-medium">{title}</span>}
    </Tag>
  );
}
