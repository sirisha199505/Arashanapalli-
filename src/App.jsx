import { useCallback, useState } from 'react';
import Page from './components/layout/Page';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import Collections from './components/home/Collections';
import WhyUs from './components/home/WhyUs';
import Spaces from './components/home/Spaces';
import About from './components/home/About';
import BrandsStrip from './components/home/BrandsStrip';
import CtaBanner from './components/home/CtaBanner';
import Faq from './components/home/Faq';
import NewArrivals from './components/home/NewArrivals';
import ProductListing from './components/product/ProductListing';
import NewArrivalsPage from './components/product/NewArrivalsPage';
import ProductPage from './components/product/ProductPage';
import BrandsPage from './components/brand/BrandsPage';
import BrandPage from './components/brand/BrandPage';
import SellerProfile from './components/profile/SellerProfile';
import Reviews from './components/profile/Reviews';
import QuotePage from './components/quote/QuotePage';
import ComparePage from './components/compare/ComparePage';
import QuoteComparePage from './components/compare/QuoteComparePage';
import TrackQuotePage from './components/track/TrackQuotePage';
import AccountPage from './components/account/AccountPage';
import CompareBar from './components/compare/CompareBar';
import QuoteBar from './components/quote/QuoteBar';
import StoriesRow from './components/stories/StoriesRow';
import StoryViewer from './components/stories/StoryViewer';
import InstagramGallery from './components/stories/InstagramGallery';
import ContactPage from './components/contact/ContactPage';
import { Button, Reveal, Section } from './components/ui';
import { SECTIONS } from './data/content';
import { useQuote } from './context/QuoteContext';
import usePageMeta from './hooks/usePageMeta';
import useRoute, { getQuery, goBack, navigate } from './hooks/useRoute';
import useSeenStories from './hooks/useSeenStories';
import { categoryPath, getBrand, getCategoryBySlug, getProduct, getProductForPath } from './utils/catalog';
import { getHeroGroup, getPostsGroup, getStoryGroups } from './utils/stories';

const STORY_GROUPS = getStoryGroups();
const POSTS_GROUP = getPostsGroup();
const HERO_GROUP = getHeroGroup();

// navigation helpers that don't depend on state
const openQuote = () => navigate('/quote');
const openCompare = () => navigate('/compare');
const openProducts = () => navigate('/products');

// browser-tab title and description for the fixed pages (product listings set their own)
const PAGE_META = {
  '/': { description: 'Arashanapalli Traders, Secunderabad — door hardware, furniture fittings and interior products since 1970. Get brand-wise quotes instantly.' },
  '/applications': { title: 'Applications', description: 'Hardware and interior products for kitchens, wardrobes, doors and every room.' },
  '/about': { title: 'About Us', description: 'Arashanapalli Traders has served Secunderabad since 1970 with door hardware, furniture fittings and interior products.' },
  '/gallery': { title: 'Gallery', description: 'Our latest work and products, from our Instagram.' },
  '/contact': { title: 'Contact', description: 'Call, WhatsApp or visit Arashanapalli Traders in General Bazar, Secunderabad.' },
  '/quote': { title: 'Get a Quote' },
  '/compare': { title: 'Compare Brands' },
  '/compare/quotes': { title: 'Compare Quotations' },
};

export default function App() {
  const { quote, itemCount, addItem, setBrand, setItemBrand, setQuantity, removeItem, clearAll, state, savedQuotations, saveQuotation, removeSaved, loadQuotation } =
    useQuote();
  const path = useRoute();
  usePageMeta(PAGE_META[path]);
  const [compareIds, setCompareIds] = useState([]);
  const { seen, markSeen } = useSeenStories();
  // { groups, start: { groupIndex, slideIndex } } while the story viewer is open
  const [story, setStory] = useState(null);

  const closeStory = useCallback(() => setStory(null), []);
  const openStory = (groups, groupIndex, slideIndex = 0) => setStory({ groups, start: { groupIndex, slideIndex } });


  const toggleCompare = useCallback(
    (id) => setCompareIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])),
    [],
  );

  const compareQuoteProducts = () => {
    setCompareIds(quote.lines.map((l) => l.product.id));
    openCompare();
  };
  // adds 1 unit of every compared product this brand carries, in this brand (other items keep their brands)
  const addBrandToQuote = (productIds, brandId) => {
    productIds
      .filter((id) => getProduct(id).brandIds.includes(brandId))
      .forEach((id) => {
        addItem(id);
        setItemBrand(id, brandId);
      });
  };

  // no brand pop-up: the product goes straight into the quote; the brand is chosen on the quote page
  // products are chosen while shopping (the quote bar then offers "Proceed"); from a brand's page in that brand
  const quoteFromShop = (product, brand) => {
    addItem(product.id);
    if (brand) setItemBrand(product.id, brand.id);
  };
  // pages where customers pick products — they get the "N selected · Proceed to quote" bar
  const shopping = ['/', '/products', '/new-arrivals', '/brands', '/compare'].includes(path) || /^\/(category|brand|product)\//.test(path);
  const showQuoteBar = shopping && itemCount > 0;
  const onProductPage = path.startsWith('/product/');

  // product page: adds the chosen brand and quantity, staying on the page (it shows a "View quote" link)
  const addToQuote = (product, brandId, quantity) => {
    addItem(product.id, quantity);
    setItemBrand(product.id, brandId);
  };

  // /product/<code>: one product's page — the shelf code is the address, e.g. /product/AT1002
  const productPage = () => {
    const product = path.startsWith('/product/') && getProductForPath(path.slice('/product/'.length));
    return product ? (
      <ProductPage
        key={product.id}
        product={product}
        onAddToQuote={addToQuote}
        onOpenQuote={openQuote}
        onQuote={quoteFromShop}
        compareIds={compareIds}
        onToggleCompare={toggleCompare}
      />
    ) : null;
  };

  // /brand/<id>: one brand with its series and products
  const brandPage = () => {
    const brand = path.startsWith('/brand/') && getBrand(decodeURIComponent(path.slice('/brand/'.length)));
    return brand ? (
      <BrandPage key={brand.id} brand={brand} query={getQuery()} onQuote={quoteFromShop} compareIds={compareIds} onToggleCompare={toggleCompare} />
    ) : null;
  };

  // /category/<slug>: the listing for one category — its own URL so it can be shared directly
  const categoryPage = () => {
    const category = path.startsWith('/category/') && getCategoryBySlug(path.slice('/category/'.length));
    return category ? (
      <ProductListing category={category} query={getQuery()} onQuote={quoteFromShop} compareIds={compareIds} onToggleCompare={toggleCompare} />
    ) : null;
  };

  // one page per URL — each nav link opens its own page instead of scrolling a single long page
  const PAGES = {
    '/': (
      <main>
        <Hero slides={HERO_GROUP} onExplore={openProducts} onRequestQuote={openQuote} />
        <Reveal>
          <Collections onPickCategory={(category) => navigate(categoryPath(category))} onViewAll={openProducts} />
        </Reveal>
        <NewArrivals onQuote={quoteFromShop} compareIds={compareIds} onToggleCompare={toggleCompare} />
        <WhyUs />
        <BrandsStrip />
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <CtaBanner />
        </Reveal>
      </main>
    ),
    '/products': <ProductListing query={getQuery()} onQuote={quoteFromShop} compareIds={compareIds} onToggleCompare={toggleCompare} />,
    '/brands': <BrandsPage />,
    '/track': <TrackQuotePage />,
    '/account': <AccountPage />,
    '/new-arrivals': <NewArrivalsPage onQuote={quoteFromShop} compareIds={compareIds} onToggleCompare={toggleCompare} />,
    '/applications': (
      <Page {...SECTIONS.applications} wide>
        <Spaces onCta={openProducts} />
        <Reveal>
          <CtaBanner />
        </Reveal>
      </Page>
    ),
    '/about': (
      <Page {...SECTIONS.about} wide>
        <About />
        <Section>
          <SellerProfile />
        </Section>
        <Section {...SECTIONS.reviews}>
          <Reviews />
        </Section>
      </Page>
    ),
    '/gallery': (
      <Page {...SECTIONS.instagram} wide>
        <StoriesRow groups={STORY_GROUPS} seen={seen} onOpen={(i) => openStory(STORY_GROUPS, i)} />
        <InstagramGallery group={POSTS_GROUP} onOpen={(group, i) => openStory([group], 0, i)} />
      </Page>
    ),
    '/contact': <ContactPage onGetQuote={openQuote} />,
    '/quote': (
      <QuotePage
        quote={quote}
        savedCount={savedQuotations.length}
        onSaveQuotation={saveQuotation}
        onBack={goBack}
        onCompare={compareQuoteProducts}
        onSetQuantity={setQuantity}
        onSetBrand={setBrand}
        onSetItemBrand={setItemBrand}
        onRemove={removeItem}
        onClear={clearAll}
      />
    ),
    '/compare/quotes': (
      <QuoteComparePage
        state={state}
        saved={savedQuotations}
        onSave={saveQuotation}
        onRemoveSaved={removeSaved}
        onUse={(quotation) => {
          loadQuotation(quotation);
          openQuote();
        }}
        onBack={goBack}
      />
    ),
    '/compare': <ComparePage productIds={compareIds} onToggleProduct={toggleCompare} onBack={goBack} onAddBrand={addBrandToQuote} />,
  };

  return (
    <>
      <Header path={path} quoteCount={itemCount} onOpenQuotes={openQuote} onGetQuote={openQuote} />

      {PAGES[path] ??
        categoryPage() ??
        productPage() ??
        brandPage() ??
        (path.startsWith('/track/') && <TrackQuotePage quotationId={decodeURIComponent(path.slice('/track/'.length)).toUpperCase()} />) ?? <NotFound />}

      <Footer />
      {!path.startsWith('/compare') && <CompareBar count={compareIds.length} onCompare={openCompare} onClear={() => setCompareIds([])} raised={showQuoteBar || onProductPage} />}
      {showQuoteBar && <QuoteBar count={itemCount} onProceed={openQuote} phoneHidden={onProductPage} />}
      <MobileNav path={path} quoteCount={itemCount} onOpenQuotes={openQuote} />

      {story && <StoryViewer groups={story.groups} start={story.start} onClose={closeStory} onSeen={markSeen} />}
    </>
  );
}

function NotFound() {
  return (
    <Page title="Page not found" subtitle="The page you're looking for doesn't exist.">
      <Button as="a" href="/">
        Back to home
      </Button>
    </Page>
  );
}
