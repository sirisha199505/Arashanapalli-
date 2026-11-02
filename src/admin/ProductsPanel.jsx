import { useState } from 'react';
import { Badge, Button, Card, EmptyState } from '../components/ui';
import { formatCurrency } from '../utils/format';
import { ErrorNote, Pager } from './fields';
import ProductForm from './ProductForm';
import useAsync, { useDebounced } from './useAsync';

const PAGE_SIZE = 25;

/** Every product in the database (hidden ones included), with add / edit / hide. */
export default function ProductsPanel({ api, initial = {} }) {
  const [search, setSearch] = useState(initial.search ?? '');
  const [category, setCategory] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // a product, {} for a new one, or null
  const [actionError, setActionError] = useState(null);
  const query = useDebounced(search);

  const lists = useAsync(() => Promise.all([api.categories.list(), api.brands.list()]), [api]);
  const [categories, brands] = lists.result?.map((r) => r.data) ?? [[], []];
  const { result, error, loading, reload } = useAsync(
    () => api.products.list({ search: query, category, new_arrival: newOnly || '', page, page_size: PAGE_SIZE }),
    [api, query, category, newOnly, page],
  );
  const products = result?.data ?? [];
  const brandName = Object.fromEntries(brands.map((b) => [b.id, b.name]));

  const toggleActive = async (product) => {
    setActionError(null);
    try {
      await (product.active ? api.products.remove(product.id) : api.products.update(product.id, { active: true }));
      reload();
    } catch (err) {
      setActionError(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search name or code"
          aria-label="Search products"
          value={search}
          onChange={(e) => (setSearch(e.target.value), setPage(1))}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
        />
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => (setCategory(e.target.value), setPage(1))}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-primary" checked={newOnly} onChange={(e) => (setNewOnly(e.target.checked), setPage(1))} />
          New arrivals only
        </label>
        <div className="ml-auto flex gap-2">
          <Button
            as="a"
            variant="secondary"
            size="sm"
            href={`/admin/stickers?${new URLSearchParams({ ...(category && { category }), ...(query && { search: query }), ...(newOnly && { new_arrival: 'true' }) })}`}
          >
            Print stickers
          </Button>
          <Button size="sm" onClick={() => setEditing({})} disabled={!categories.length}>
            Add product
          </Button>
        </div>
      </div>

      <ErrorNote error={error ?? lists.error ?? actionError} />
      {!loading && !products.length && !error && <EmptyState title="No products found" message="Try another search or category." />}

      <Card className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[50rem] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 text-right font-medium">Base price</th>
              <th className="px-4 py-2 font-medium">Brands</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className={p.active ? '' : 'text-muted'}>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs font-semibold">{p.code}</td>
                <td className="px-4 py-2.5">
                  <span className="font-medium">{p.name}</span>
                  {p.new_arrival && <Badge tone="solidPrimary" className="ml-2">New</Badge>}
                  {!p.active && <Badge className="ml-2">Hidden</Badge>}
                  {p.mock && <Badge className="ml-2">Sample</Badge>}
                </td>
                <td className="px-4 py-2.5">{p.category}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {formatCurrency(p.base_price)} / {p.unit}
                </td>
                <td className="max-w-56 truncate px-4 py-2.5" title={(p.brand_ids ?? []).map((id) => brandName[id] ?? id).join(', ')}>
                  {(p.brand_ids ?? []).map((id) => brandName[id] ?? id).join(', ')}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
                    Edit
                  </Button>
                  <Button variant={p.active ? 'danger' : 'ghost'} size="sm" onClick={() => toggleActive(p)}>
                    {p.active ? 'Hide' : 'Show'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pager page={page} totalPages={result?.total_pages ?? 1} onChange={setPage} />

      {editing && (
        <ProductForm
          product={editing}
          categories={categories}
          brands={brands}
          api={api}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
