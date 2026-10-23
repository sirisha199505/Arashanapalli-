import { useCallback, useMemo, useState } from 'react';
import TopBar from './components/layout/TopBar';
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
import ProductFilters from './components/product/ProductFilters';
import ProductGrid from './components/product/ProductGrid';
import SellerProfile from './components/profile/SellerProfile';
import Reviews from './components/profile/Reviews';
import BrandSelectModal from './components/quote/BrandSelectModal';
import QuoteDrawer from './components/quote/QuoteDrawer';
import StoriesRow from './components/stories/StoriesRow';
import StoryViewer from './components/stories/StoryViewer';
import InstagramGallery from './components/stories/InstagramGallery';
import { Reveal, Section, Tabs } from './components/ui';
import { PRODUCTS } from './data/catalog';
import { SECTIONS } from './data/content';
import { useQuote } from './context/QuoteContext';
import useSeenStories from './hooks/useSeenStories';
import { filterProducts, getCategories } from './utils/catalog';
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
  const { quotes, itemCount, addItem, setQuantity, removeItem, clearBrand } = useQuote();
  const [activeTab, setActiveTab] = useState('products');
  // one filter state drives the header search, collection cards and product filters
  const [filters, setFilters] = useState({ category: null, search: '' });
  const [activeProduct, setActiveProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { seen, markSeen } = useSeenStories();
  // { groups, start: { groupIndex, slideIndex } } while the story viewer is open
  const [story, setStory] = useState(null);

  const products = useMemo(() => filterProducts(PRODUCTS, filters), [filters]);
  const closeBrandModal = useCallback(() => setActiveProduct(null), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = () => setDrawerOpen(true);
  const closeStory = useCallback(() => setStory(null), []);
  const openStory = (groups, groupIndex, slideIndex = 0) => setStory({ groups, start: { groupIndex, slideIndex } });

  const showProducts = (patch = {}) => {
    setFilters((f) => ({ ...f, ...patch }));
    setActiveTab('products');
    scrollToProducts();
  };
  const setSearch = (search) => setFilters((f) => ({ ...f, search }));
  const showProfile = () => {
    setActiveTab('profile');
    scrollToProducts();
  };

  const handleAdd = (productId, brandId, quantity) => {
    addItem(productId, brandId, quantity);
    setActiveProduct(null);
    setDrawerOpen(true);
  };

  const PANELS = {
    profile: <SellerProfile />,
    products: (
      <>
        <ProductFilters categories={CATEGORIES} filters={filters} onChange={setFilters} />
        <ProductGrid products={products} onQuote={setActiveProduct} />
      </>
    ),
    reviews: <Reviews />,
  };

  return (
    <>
      <TopBar />
      <Header
        quoteCount={itemCount}
        onOpenQuotes={openDrawer}
        onGetQuote={() => showProducts()}
        search={filters.search}
        onSearch={setSearch}
        onSearchSubmit={() => showProducts()}
      />

      <main>
        <Hero
          slides={HERO_GROUP}
          onExplore={() => showProducts()}
          onWatchStory={() => openStory(STORY_GROUPS, 0)}
          onOpenSlide={(i) => openStory([HERO_GROUP], 0, i)}
        />
        <Reveal>
          <Collections onPickCategory={(category) => showProducts({ category })} />
        </Reveal>
        <WhyUs />

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
          <Spaces />
        </Reveal>
        <Reveal>
          <About onLearnMore={showProfile} />
        </Reveal>

        <Section id="instagram" {...SECTIONS.instagram} className="pb-0 md:pb-0" />
        <StoriesRow groups={STORY_GROUPS} seen={seen} onOpen={(i) => openStory(STORY_GROUPS, i)} />
        <InstagramGallery group={POSTS_GROUP} onOpen={(group, i) => openStory([group], 0, i)} />

        <BrandsStrip />
        <Reveal>
          <CtaBanner />
        </Reveal>
      </main>

      <Footer />
      <MobileNav quoteCount={itemCount} onOpenQuotes={openDrawer} />

      {story && <StoryViewer groups={story.groups} start={story.start} onClose={closeStory} onSeen={markSeen} />}
      {activeProduct && (
        <BrandSelectModal key={activeProduct.id} product={activeProduct} onClose={closeBrandModal} onAdd={handleAdd} />
      )}
      <QuoteDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        quotes={quotes}
        onQuantityChange={setQuantity}
        onRemove={removeItem}
        onClear={clearBrand}
      />
    </>
  );
}
