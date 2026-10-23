/** Standard page section with a left-aligned heading and optional action on the right. */
export default function Section({ id, title, subtitle, action, className = '', children }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl scroll-mt-24 px-4 py-10 md:py-14 ${className}`}>
      {title && (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
