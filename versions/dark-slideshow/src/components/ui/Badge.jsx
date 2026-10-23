const TONES = {
  neutral: 'bg-surface-2 text-muted',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/15 text-emerald-500',
  overlay: 'bg-black/70 text-white backdrop-blur',
  solidSuccess: 'bg-emerald-600 text-white',
  Premium: 'bg-amber-500/15 text-amber-500',
  Standard: 'bg-sky-500/15 text-sky-500',
  Economy: 'bg-emerald-500/15 text-emerald-500',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-block w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONES[tone] ?? TONES.neutral} ${className}`}>
      {children}
    </span>
  );
}
