const stepBtn = 'h-9 w-9 text-lg font-bold text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40';

export default function QuantityInput({ value, onChange, min = 1 }) {
  const set = (n) => onChange(Math.max(min, Number.isFinite(n) ? n : min));
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-line bg-surface">
      <button type="button" className={stepBtn} onClick={() => set(value - 1)} disabled={value <= min} aria-label="Decrease">
        −
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => set(parseInt(e.target.value, 10))}
        className="h-9 w-14 border-x border-line bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Quantity"
      />
      <button type="button" className={stepBtn} onClick={() => set(value + 1)} aria-label="Increase">
        +
      </button>
    </div>
  );
}
