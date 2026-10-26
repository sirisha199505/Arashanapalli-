export default function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-primary text-white' : 'bg-surface text-muted ring-1 ring-line hover:text-ink hover:ring-primary'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
