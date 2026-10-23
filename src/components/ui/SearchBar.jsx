import Icon from './Icon';

const SIZES = {
  md: { form: 'rounded-xl px-3', input: 'py-2 text-sm' },
  lg: { form: 'rounded-xl p-1.5 pl-4', input: 'py-2 text-base' },
  pill: { form: 'rounded-full p-1 pl-4', input: 'py-1.5 text-sm' },
};

const TONES = {
  light: 'border-line bg-surface text-ink placeholder:text-muted focus-within:border-primary',
  dark: 'border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-within:border-primary',
};

/** Controlled search field; used in the header and the product filters. */
export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search products…', size = 'md', tone = 'light', className = '' }) {
  const s = SIZES[size];
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={`flex items-center gap-2 border ${TONES[tone]} ${s.form} ${className}`}
    >
      {size !== 'pill' && <Icon name="search" className="h-4 w-4 shrink-0 text-muted" />}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className={`min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-inherit placeholder:opacity-70 ${s.input}`}
      />
      {size === 'lg' && (
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
          Search
        </button>
      )}
      {size === 'pill' && (
        <button type="submit" aria-label="Search" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-white hover:bg-primary-hover">
          <Icon name="search" className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
