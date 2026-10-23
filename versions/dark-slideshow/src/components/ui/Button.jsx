const VARIANTS = {
  primary: 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover',
  secondary: 'bg-surface text-ink ring-1 ring-line hover:ring-primary hover:text-primary',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
  danger: 'text-primary hover:bg-primary/10',
  whatsapp: 'bg-[#25d366] text-white hover:brightness-95',
};

const SIZES = {
  icon: 'h-10 w-10',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({ variant = 'primary', size = 'md', className = '', as: Tag = 'button', ...props }) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
