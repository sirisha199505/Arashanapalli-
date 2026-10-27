import { useCallback, useMemo, useState } from 'react';
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
import { Reveal, Section, Tabs } from './components/ui';
import { PRODUCTS } from './data/catalog';
import { SECTIONS } from './data/content';
import { useQuote } from './context/QuoteContext';
import useHashRoute from './hooks/useHashRoute';
import useSeenStories from './hooks/useSeenStories';
import { filterProducts, getCategories, getProduct } from './utils/catalog';
import { getHeroGroup, getPostsGroup, getStoryGroups } from './utils/stories';

const CATEGORIES = getCategories();
const STORY_GROUPS = getStoryGroups();
const POSTS_GROUP = getPostsGroup();
const HERO_GROUP = getHeroGroup();

const TABS = [
  { id: 'profile', label: 'Seller Profile' },
  { id: 'products', label: 'Products & Services' },
  { id: 'reviews', label: 'Reviews' },
];

const scrollToProducts = () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });

export default function App() {
  const { quote, itemCount, addItem, setBrand, setItemBrand, setQuantity, removeItem, clearAll } = useQuote();
  const [activeTab, setActiveTab] = useState('products');
  // one filter state drives the header search, collection cards and product filters
  const [filters, setFilters] = useState({ category: null, search: '' });
  const quotePage = useHashRoute('quote');
  const comparePage = useHashRoute('compare');
  const [compareIds, setCompareIds] = useState([]);
  const { seen, markSeen } = useSeenStories();
  // { groups, start: { groupIndex, slideIndex } } while the story viewer is open
  const [story, setStory] = useState(null);

  const products = useMemo(() => filterProducts(PRODUCTS, filters), [filters]);
  const closeStory = useCallback(() => setStory(null), []);
  const openStory = (groups, groupIndex, slideIndex = 0) => setStory({ groups, start: { groupIndex, slideIndex } });

  const showProducts = (patch = {}) => {
    setFilters((f) => ({ ...f, ...patch }));
    setActiveTab('products');
    scrollToProducts();
  };
  const showProfile = () => {
    setActiveTab('profile');
    scrollToProducts();
  };

  const toggleCompare = useCallback(
    (id) => setCompareIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])),
    [],
  );

  const compareQuoteProducts = () => {
    setCompareIds(quote.lines.map((l) => l.product.id));
    comparePage.open();
  };
  // adds 1 unit of every compared product this brand carries, in this brand (other items keep their brands)
  const addBrandToQuote = (productIds, brandId) => {
    productIds
      .filter((id) => getProduct(id).brandIds.includes(brandId))
      .forEach((id) => {
        addItem(id);
        setItemBrand(id, brandId);
      });
    quotePage.open();
  };

  // no brand pop-up: the product goes straight into the quote; the brand is chosen on the quote page

  const quoteFromShop = (product) => {
    addItem(product.id);
    quotePage.open();
  };


  const PANELS = {
    profile: <SellerProfile />,
    products: (
      <>
        <ProductFilters categories={CATEGORIES} filters={filters} onChange={setFilters} />
        <ProductGrid key={`${filters.category}|${filters.search}`} products={products} onQuote={quoteFromShop} compareIds={compareIds} onToggleCompare={toggleCompare} />
      </>
    ),
    reviews: <Reviews />,
  };

  return (
    <>
      <Header
        quoteCount={itemCount}
        onOpenQuotes={quotePage.open}
        onGetQuote={quotePage.open}
      />

      {quotePage.active ? (
        <QuotePage
          quote={quote}
          onBack={quotePage.close}
          onCompare={compareQuoteProducts}
          onSetQuantity={setQuantity}
          onSetBrand={setBrand}
          onSetItemBrand={setItemBrand}
          onRemove={removeItem}
          onClear={clearAll}
        />
      ) : comparePage.active ? (
        <ComparePage productIds={compareIds} onToggleProduct={toggleCompare} onBack={comparePage.close} onAddBrand={addBrandToQuote} />
      ) : (
        <main>
          <Hero
            slides={HERO_GROUP}
            onExplore={() => showProducts()}
            onRequestQuote={quotePage.open}
          />
          <Reveal>
            <Collections onPickCategory={(category) => showProducts({ category })} onViewAll={() => showProducts({ category: null })} />
          </Reveal>
          <WhyUs />
          <Spaces onCta={() => showProducts()} />

          <Reveal>
            <Section id="products" {...SECTIONS.products}>
              <div className="space-y-6">
                <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
                <div role="tabpanel" className="space-y-6">
                  {PANELS[activeTab]}
                </div>
              </div>
            </Section>
          </Reveal>

          <Reveal>
            <About onLearnMore={showProfile} />
          </Reveal>

          <Reveal>
            <Faq />
          </Reveal>

          <Section id="instagram" {...SECTIONS.instagram} className="pb-0 md:pb-0" />
          <StoriesRow groups={STORY_GROUPS} seen={seen} onOpen={(i) => openStory(STORY_GROUPS, i)} />
          <InstagramGallery group={POSTS_GROUP} onOpen={(group, i) => openStory([group], 0, i)} />

          <BrandsStrip />
          <Reveal>
            <CtaBanner />
          </Reveal>
        </main>
      )}

      <Footer />
      {!comparePage.active && <CompareBar count={compareIds.length} onCompare={comparePage.open} onClear={() => setCompareIds([])} />}
      <MobileNav quoteCount={itemCount} onOpenQuotes={quotePage.open} />

      {story && <StoryViewer groups={story.groups} start={story.start} onClose={closeStory} onSeen={markSeen} />}
    </>
  );
}
