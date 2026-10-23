const TONES = {
  neutral: 'bg-surface-2 text-muted',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-600/10 text-emerald-700',
  overlay: 'bg-black/70 text-white backdrop-blur',
  solidSuccess: 'bg-brand text-white',
  Premium: 'bg-primary/15 text-primary-hover',
  Standard: 'bg-sage/30 text-brand',
  Economy: 'bg-surface-2 text-muted',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-block w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONES[tone] ?? TONES.neutral} ${className}`}>
      {children}
    </span>
  );
}
