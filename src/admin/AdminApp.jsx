import { useCallback, useEffect, useMemo, useState } from 'react';
import useRoute, { navigate } from '../hooks/useRoute';
import { clearSession, createAdminApi, loadSession, saveSession } from './adminApi';
import AdminLayout from './AdminLayout';
import LoginPage from './LoginPage';
import DashboardPanel from './DashboardPanel';
import QuotesPanel from './QuotesPanel';
import CustomersPanel from './CustomersPanel';
import CategoriesPanel from './CategoriesPanel';
import BrandsPanel from './BrandsPanel';
import ProductsPanel from './ProductsPanel';
import useAsync from './useAsync';

// Sidebar sections; each item is a page at its own /admin/… URL
const SECTIONS = [
  {
    items: [{ path: '/admin', label: 'Dashboard', icon: 'grid', Panel: DashboardPanel, subtitle: "Welcome back! Here's what's happening with your store." }],
  },
  {
    title: 'Sales',
    items: [
      { path: '/admin/quotes', label: 'Quote Requests', icon: 'file', Panel: QuotesPanel, subtitle: 'Quotes customers sent from the website.' },
      { path: '/admin/customers', label: 'Customers', icon: 'users', Panel: CustomersPanel, subtitle: 'Everyone who has asked for a quote.' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { path: '/admin/categories', label: 'Categories', icon: 'layers', Panel: CategoriesPanel, subtitle: 'Category names, icons and the order they appear in on the website.' },
      { path: '/admin/brands', label: 'Brands', icon: 'tag', Panel: BrandsPanel, subtitle: 'Brand price factors and the specs shown on the compare page.' },
      { path: '/admin/products', label: 'Products', icon: 'box', Panel: ProductsPanel, subtitle: 'Everything listed on the website, with prices and brands.' },
    ],
  },
];
const PAGES = SECTIONS.flatMap((s) => s.items);

// what the top-bar search opens: quote numbers and mobile numbers go to quotes, anything else to products
const searchTarget = (term) => (/^(AT-|[+\d][\d\s-]*$)/i.test(term) ? '/admin/quotes' : '/admin/products');

/** The /admin area: sign in, then the dashboard and the sales and catalog pages. */
export default function AdminApp() {
  const [session, setSession] = useState(loadSession);
  const path = useRoute();
  // filters another page opens a page with, e.g. { status: 'new' } for /admin/quotes; `n` remounts the page so they apply
  const [initial, setInitial] = useState({ n: 0, path: null, values: {} });

  // filters belong to the page they were opened for — drop them once the admin moves elsewhere (e.g. via the sidebar)
  useEffect(() => {
    setInitial((i) => (i.path && i.path !== path ? { ...i, path: null, values: {} } : i));
  }, [path]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);
  const api = useMemo(() => session && createAdminApi(session.token, logout), [session, logout]);

  const goTo = useCallback((to, values = {}) => {
    setInitial((i) => ({ n: i.n + 1, path: to, values }));
    navigate(to);
  }, []);

  const page = PAGES.find((p) => p.path === path) ?? PAGES[0];
  // refreshed on every page change so the bell stays current
  const counts = useAsync(() => (api ? api.dashboard('all') : Promise.resolve(null)), [api, path]);

  if (!session) {
    return (
      <LoginPage
        onLogin={(s) => {
          saveSession(s);
          setSession(s);
        }}
      />
    );
  }

  const { Panel } = page;
  return (
    <AdminLayout
      sections={SECTIONS}
      path={path}
      page={page}
      session={session}
      awaiting={counts.result?.awaiting_reply ?? 0}
      onSearch={(term) => goTo(searchTarget(term), { search: term })}
      onNavigate={goTo}
      onLogout={logout}
    >
      <Panel key={`${page.path}-${initial.n}`} api={api} initial={initial.path === page.path ? initial.values : {}} onNavigate={goTo} />
    </AdminLayout>
  );
}
