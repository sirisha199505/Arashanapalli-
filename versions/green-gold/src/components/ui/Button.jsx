const VARIANTS = {
  primary: 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-hover',
  dark: 'bg-dark text-white hover:bg-black',
  secondary: 'bg-surface text-ink ring-1 ring-line hover:ring-primary hover:text-primary',
  light: 'bg-white/10 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/20',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
  danger: 'text-primary hover:bg-primary/10',
  whatsapp: 'bg-[#25d366] text-white hover:brightness-95',
};

const SIZES = {
  icon: 'h-10 w-10',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
};

export default function Button({ variant = 'primary', size = 'md', className = '', as: Tag = 'button', ...props }) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
