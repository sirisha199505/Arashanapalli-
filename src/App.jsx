import { useCallback, useMemo, useState } from 'react';
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
import ProductFilters from './components/product/ProductFilters';
import ProductGrid from './components/product/ProductGrid';
import SellerProfile from './components/profile/SellerProfile';
import Reviews from './components/profile/Reviews';
import QuotePage from './components/quote/QuotePage';
import ComparePage from './components/compare/ComparePage';
import CompareBar from './components/compare/CompareBar';
import StoriesRow from './components/stories/StoriesRow';
import StoryViewer from './components/stories/StoryViewer';
import InstagramGallery from './components/stories/InstagramGallery';
import ContactPage from './components/contact/ContactPage';
import { Button, Reveal, Section } from './components/ui';
import { PRODUCTS } from './data/catalog';
import { SECTIONS } from './data/content';
import { useQuote } from './context/QuoteContext';
import useRoute, { goBack, navigate } from './hooks/useRoute';
import useSeenStories from './hooks/useSeenStories';
import { filterProducts, getCategories, getProduct } from './utils/catalog';
import { getHeroGroup, getPostsGroup, getStoryGroups } from './utils/stories';

const CATEGORIES = getCategories();
const STORY_GROUPS = getStoryGroups();
const POSTS_GROUP = getPostsGroup();
const HERO_GROUP = getHeroGroup();

// navigation helpers that don't depend on state
const openQuote = () => navigate('/quote');
const openCompare = () => navigate('/compare');
const openProducts = () => navigate('/products');

export default function App() {
  const { quote, itemCount, addItem, setBrand, setItemBrand, setQuantity, removeItem, clearAll } = useQuote();
  const path = useRoute();
  // one filter state drives the collection cards and the product filters
  const [filters, setFilters] = useState({ category: null, search: '' });
  const [compareIds, setCompareIds] = useState([]);
  const { seen, markSeen } = useSeenStories();
  // { groups, start: { groupIndex, slideIndex } } while the story viewer is open
  const [story, setStory] = useState(null);

  const products = useMemo(() => filterProducts(PRODUCTS, filters), [filters]);
  const closeStory = useCallback(() => setStory(null), []);
  const openStory = (groups, groupIndex, slideIndex = 0) => setStory({ groups, start: { groupIndex, slideIndex } });

  const showProducts = (patch = {}) => {
    setFilters((f) => ({ ...f, ...patch }));
    openProducts();
  };

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
    openQuote();
  };

  // no brand pop-up: the product goes straight into the quote; the brand is chosen on the quote page
  const quoteFromShop = (product) => {
    addItem(product.id);
    openQuote();
  };

  // one page per URL — each nav link opens its own page instead of scrolling a single long page
  const PAGES = {
    '/': (
      <main>
        <Hero slides={HERO_GROUP} onExplore={() => showProducts()} onRequestQuote={openQuote} />
        <Reveal>
          <Collections onPickCategory={(category) => showProducts({ category })} onViewAll={() => showProducts({ category: null })} />
        </Reveal>
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
    '/products': (
      <Page {...SECTIONS.products}>
        <div className="space-y-6">
          <ProductFilters categories={CATEGORIES} filters={filters} onChange={setFilters} />
          <ProductGrid key={`${filters.category}|${filters.search}`} products={products} onQuote={quoteFromShop} compareIds={compareIds} onToggleCompare={toggleCompare} />
        </div>
      </Page>
    ),
    '/applications': (
      <Page {...SECTIONS.applications} wide>
        <Spaces onCta={() => showProducts()} />
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
        onBack={goBack}
        onCompare={compareQuoteProducts}
        onSetQuantity={setQuantity}
        onSetBrand={setBrand}
        onSetItemBrand={setItemBrand}
        onRemove={removeItem}
        onClear={clearAll}
      />
    ),
    '/compare': <ComparePage productIds={compareIds} onToggleProduct={toggleCompare} onBack={goBack} onAddBrand={addBrandToQuote} />,
  };

  return (
    <>
      <Header path={path} quoteCount={itemCount} onOpenQuotes={openQuote} onGetQuote={openQuote} />

      {PAGES[path] ?? <NotFound />}

      <Footer />
      {path !== '/compare' && <CompareBar count={compareIds.length} onCompare={openCompare} onClear={() => setCompareIds([])} />}
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
