import { Chip, SearchBar } from '../ui';

export default function ProductFilters({ categories, filters, onChange }) {
  const update = (patch) => onChange({ ...filters, ...patch });
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {[null, ...categories].map((category) => (
          <Chip key={category ?? 'all'} active={filters.category === category} onClick={() => update({ category })}>
            {category ?? 'All Products'}
          </Chip>
        ))}
      </div>
      <SearchBar value={filters.search} onChange={(search) => update({ search })} className="md:w-72" />
    </div>
  );
}
