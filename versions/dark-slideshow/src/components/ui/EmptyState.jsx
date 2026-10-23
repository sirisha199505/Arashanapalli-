export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {action}
    </div>
  );
}
