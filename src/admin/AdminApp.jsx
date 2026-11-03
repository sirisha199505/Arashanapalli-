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
import StickerSheet from './StickerSheet';
import QuoteEditor from './QuoteEditor';
import StaffPanel from './StaffPanel';
import PackagesPanel from './PackagesPanel';
import OrdersPanel from './OrdersPanel';
import AuditPanel from './AuditPanel';
import BulkUpdatePanel from './BulkUpdatePanel';
import ImportPanel from './ImportPanel';
import useAsync from './useAsync';

// Sidebar sections; each item is a page at its own /admin/… URL
const SECTIONS = [
  {
    items: [{ path: '/admin', label: 'Dashboard', icon: 'grid', Panel: DashboardPanel, subtitle: "Welcome back! Here's what's happening with your store." }],
  },
  {
    title: 'Sales',
    items: [
      { path: '/admin/quotes', label: 'Quotations', icon: 'file', Panel: QuotesPanel, subtitle: 'Website quote requests and quotations made by the sales team — latest version of each.' },
      { path: '/admin/orders', label: 'Orders', icon: 'checkCircle', Panel: OrdersPanel, subtitle: 'Accepted quotations — track delivery and payment.' },
      { path: '/admin/customers', label: 'Customers', icon: 'users', Panel: CustomersPanel, subtitle: 'Everyone who has asked for a quote.' },
      { path: '/admin/packages', label: 'Packages', icon: 'box', Panel: PackagesPanel, subtitle: 'Saved sets of products — add a whole package to a quotation in one click.' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { path: '/admin/categories', label: 'Categories', icon: 'layers', Panel: CategoriesPanel, subtitle: 'Category names, icons and the order they appear in on the website.' },
      { path: '/admin/brands', label: 'Brands', icon: 'tag', Panel: BrandsPanel, subtitle: 'Brand price factors and the specs shown on the compare page.' },
      { path: '/admin/products', label: 'Products', icon: 'box', Panel: ProductsPanel, subtitle: 'Everything listed on the website, with prices and brands.' },
      { path: '/admin/bulk', label: 'Bulk update', icon: 'layers', Panel: BulkUpdatePanel, subtitle: "Update many products at once, a page at a time — a brand's prices, stock, photos and descriptions, or product details. Every change goes into the audit log." },
      { path: '/admin/import', label: 'Import products', icon: 'file', Panel: ImportPanel, subtitle: "Load the client's filled-in product Excel — check it first, then import it all at once." },
    ],
    adminOnly: true,
  },
  {
    title: 'Team',
    items: [
      { path: '/admin/staff', label: 'Staff', icon: 'users', Panel: StaffPanel, subtitle: 'Sales team accounts and what each can do.' },
      { path: '/admin/audit', label: 'Audit log', icon: 'clock', Panel: AuditPanel, subtitle: 'Every price, brand, status and role change — who did it, when, from what to what.' },
    ],
    adminOnly: true,
  },
];
const ADMIN = 1;
// what a role may open: the catalog and staff accounts are admin-only (the backend enforces this too)
const sectionsFor = (role) => SECTIONS.filter((s) => !s.adminOnly || role === ADMIN);

// what the top-bar search opens: quote numbers and mobile numbers go to quotes, anything else to products
const searchTarget = (term) => (/^(AT-|[+\d][\d\s-]*$)/i.test(term) ? '/admin/quotes' : '/admin/products');

/** The /admin area: sign in, then the dashboard and the sales and catalog pages. */
export default function AdminApp() {
  const [session, setSession] = useState(loadSession);
  const path = useRoute();
  // filters another page opens a page with, e.g. { tab: 'not_contacted' } for /admin/quotes; `n` remounts the page so they apply
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

  const sections = sectionsFor(session?.role ?? ADMIN);
  const pages = sections.flatMap((s) => s.items);
  // /admin/quotes/<id> and /admin/quotes/new open one quotation inside the Quotations section
  const quoteMatch = path.match(/^\/admin\/quotes\/(new|\d+)$/);
  const page = quoteMatch
    ? { ...pages.find((p) => p.path === '/admin/quotes'), label: quoteMatch[1] === 'new' ? 'New quotation' : 'Quotation', subtitle: quoteMatch[1] === 'new' ? 'For walk-in, phone or WhatsApp customers.' : 'Edit items to save a new version; follow-up details save on their own.' }
    : (pages.find((p) => p.path === path) ?? pages[0]);
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

  // printable page, opened in its own tab from Products → Print stickers
  if (path === '/admin/stickers') return <StickerSheet api={api} />;

  const { Panel } = page;
  return (
    <AdminLayout
      sections={sections}
      path={path}
      page={page}
      session={session}
      awaiting={counts.result?.awaiting_reply ?? 0}
      onSearch={(term) => goTo(searchTarget(term), { search: term })}
      onNavigate={goTo}
      onLogout={logout}
    >
      {quoteMatch ? (
        <QuoteEditor key={quoteMatch[1]} api={api} id={quoteMatch[1]} session={session} onNavigate={goTo} />
      ) : (
        <Panel key={`${page.path}-${initial.n}`} api={api} session={session} initial={initial.path === page.path ? initial.values : {}} onNavigate={goTo} />
      )}
    </AdminLayout>
  );
}
