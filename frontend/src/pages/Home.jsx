import Hero from './home/Hero';
import FeaturedCollection from './home/FeaturedCollection';
import ProductRail from './home/ProductRail';
import Craftsmanship from './home/Craftsmanship';
import ArtOfTime from './home/ArtOfTime';
import CategoriesGrid from './home/CategoriesGrid';
import JournalPreview from './home/JournalPreview';
import Testimonials from './home/Testimonials';
import Newsletter from './home/Newsletter';
import usePageMeta from '../hooks/usePageMeta';

export default function Home() {
  usePageMeta({ title: 'Time, Refined.', description: 'Luxora Watches — precision-engineered timepieces for those who appreciate every second. Shop automatic, chronograph, diver and dress watches in Pakistan.' });
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <ProductRail
        eyebrow="New Arrivals"
        title="Just landed"
        description="The latest additions to the Luxora collection."
        query={{ sort: 'newest' }}
        viewAllHref="/shop?filter=new"
      />
      <Craftsmanship />
      <ArtOfTime />
      <ProductRail
        eyebrow="Best Sellers"
        title="Most coveted"
        description="The pieces our collectors return to again and again."
        query={{ sort: 'best_selling' }}
        viewAllHref="/shop?filter=best"
      />
      <CategoriesGrid />
      <JournalPreview />
      <Testimonials />
      <Newsletter />
    </>
  );
}
