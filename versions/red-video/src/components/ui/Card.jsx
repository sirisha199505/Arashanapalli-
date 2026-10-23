/** Base surface used by every card on the site. */
export default function Card({ as: Tag = 'div', interactive = false, className = '', ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-line bg-surface ${interactive ? 'transition hover:-translate-y-0.5 hover:border-primary/60' : ''} ${className}`}
      {...props}
    />
  );
}
