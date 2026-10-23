/** Standard page section: eyebrow label, serif title, optional subtitle and right-side action. */
export default function Section({ id, eyebrow, title, subtitle, action, className = '', children }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl scroll-mt-24 px-4 py-12 md:py-16 ${className}`}>
      {(eyebrow || title) && (
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>}
            {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
