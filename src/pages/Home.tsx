import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useHomepageData, Product } from '../hooks/useHomepageData';
import { cn } from '../lib/utils';
import { PageTransition } from '../components/PageTransition';
import { OptimizedImage } from '../components/OptimizedImage';
import { lazy, Suspense } from 'react';

const HeroCanvas = lazy(() => import('../components/HeroCanvas').then(m => ({ default: m.HeroCanvas })));

export function Home() {
  const { setCursorVariant } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { content, newArrivals, bestSellers, categories, loading } = useHomepageData();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Hero parallax
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Editorial Parallax
  const editorialY1 = useTransform(scrollYProgress, [0.4, 0.8], ["0%", "-20%"]);
  const editorialY2 = useTransform(scrollYProgress, [0.4, 0.8], ["20%", "-10%"]);

  const handleExploreEnter = () => setCursorVariant('explore');
  const handleViewEnter = () => setCursorVariant('view');
  const handleLeave = () => setCursorVariant('default');

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Link 
      to={`/product/${product.id}`}
      className="group block"
      onMouseEnter={handleViewEnter}
      onMouseLeave={handleLeave}
    >
      <div className="relative aspect-[3/4] bg-drakn-charcoal overflow-hidden mb-4">
        {product.images?.[0] ? (
          <OptimizedImage 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-drakn-muted uppercase text-xs tracking-widest">
            No Image
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-drakn-light text-drakn-base px-2 py-1 font-bold">
            New
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <h3 className="text-xs uppercase tracking-widest text-drakn-light font-medium">{product.name}</h3>
        <span className="text-xs text-drakn-muted">{formatPrice(product.price)}</span>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-drakn-graphite mt-1">{product.category}</p>
    </Link>
  );

  return (
    <PageTransition>
      <div className="w-full" ref={containerRef}>
        
        {/* 1. HERO SECTION */}
        <section className="relative h-screen w-full overflow-hidden bg-drakn-base flex items-center justify-center">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
          >
            <Suspense fallback={<div className="w-full h-full bg-drakn-base absolute inset-0" />}>
              <HeroCanvas />
            </Suspense>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-drakn-base/20 to-drakn-base opacity-80 z-10 pointer-events-none" />
            
            {content?.hero?.image && (
              <OptimizedImage 
                src={content.hero.image} 
                alt="Hero" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-30 scale-105 pointer-events-none"
                priority={true}
              />
            )}
          </motion.div>

          <div className="relative z-10 max-w-[1600px] w-full px-6 md:px-12 flex flex-col items-center justify-center text-center">
            <div className="overflow-hidden">
              <motion.h1 
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-5xl md:text-8xl lg:text-[10rem] leading-none font-display font-bold tracking-[0.05em] text-drakn-light mb-6 mix-blend-difference"
              >
                {content?.hero?.headline || "DRAKN"}
              </motion.h1>
            </div>
            
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-drakn-light/80 mb-12 max-w-lg mx-auto"
              >
                {content?.hero?.subheading || "Architectural precision. Timeless form."}
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <Link 
                to={content?.hero?.ctaLink || "/shop"}
                onMouseEnter={handleExploreEnter}
                onMouseLeave={handleLeave}
                className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] border border-drakn-light/30 px-8 py-4 hover:bg-drakn-light hover:text-drakn-base transition-all duration-500 bg-drakn-base/50 backdrop-blur-sm"
              >
                {content?.hero?.ctaText || "Explore Collection"}
              </Link>
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-drakn-muted"
          >
            <span className="text-[10px] uppercase tracking-[0.3em]" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-drakn-muted to-transparent" />
          </motion.div>
        </section>

      {/* 2. NEW ARRIVALS */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-drakn-graphite pb-8">
          <h2 className="text-2xl md:text-4xl font-display uppercase tracking-widest">New Arrivals</h2>
          <Link 
            to="/shop/new" 
            className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-drakn-muted hover:text-drakn-light transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-drakn-charcoal" />)}
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {newArrivals.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center border border-drakn-graphite border-dashed">
            <span className="text-xs uppercase tracking-[0.2em] text-drakn-muted">Collection Emerging</span>
            <h3 className="text-xl font-display uppercase tracking-widest mt-4">The New Standard</h3>
            <p className="text-sm text-drakn-graphite mt-2">New pieces are currently being prepared in our atelier.</p>
          </div>
        )}
      </section>

      {/* 3. FEATURED COLLECTION & CATEGORIES (Editorial Grid) */}
      <section className="py-24 bg-drakn-dark relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            {/* Featured Collection Banner */}
            <div className="col-span-1 md:col-span-8">
              <Link 
                to={content?.featuredCollection?.link || "/collections/core"}
                className="group block relative aspect-square md:aspect-[16/9] overflow-hidden bg-drakn-charcoal"
                onMouseEnter={handleExploreEnter}
                onMouseLeave={handleLeave}
              >
                {content?.featuredCollection?.image ? (
                  <OptimizedImage 
                    src={content.featuredCollection.image} 
                    alt="Featured Collection" 
                    className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-1000"
                  />
                ) : (
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity opacity-50 group-hover:scale-105 transition-transform duration-1000" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-drakn-base/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-drakn-muted block mb-2">Featured</span>
                    <h3 className="text-3xl md:text-5xl font-display uppercase tracking-widest text-drakn-light">
                      {content?.featuredCollection?.title || "Core Collection"}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-drakn-light/30 flex items-center justify-center group-hover:bg-drakn-light group-hover:text-drakn-base transition-colors duration-500 hidden md:flex">
                    <ArrowUpRight size={20} strokeWidth={1} />
                  </div>
                </div>
              </Link>
            </div>

            {/* Categories */}
            <div className="col-span-1 md:col-span-4 flex flex-col justify-between">
              <h3 className="text-xs uppercase tracking-[0.2em] text-drakn-muted mb-8 pb-4 border-b border-drakn-graphite">Shop by Form</h3>
              
              {loading ? (
                <div className="flex-grow flex flex-col gap-4 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-drakn-charcoal" />)}
                </div>
              ) : categories.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {categories.map((cat, i) => (
                    <motion.li 
                      key={cat.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link 
                        to={`/category/${cat.id}`}
                        className="group flex items-center justify-between py-6 border-b border-drakn-graphite/50 hover:border-drakn-light transition-colors"
                        onMouseEnter={handleViewEnter}
                        onMouseLeave={handleLeave}
                      >
                        <span className="text-xl font-display uppercase tracking-widest group-hover:pl-4 transition-all duration-300">{cat.name}</span>
                        <ArrowRight size={16} className="text-drakn-muted group-hover:text-drakn-light transition-colors" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex-grow flex flex-col gap-2">
                  {['Outerwear', 'Tailoring', 'Essentials', 'Bottoms'].map((cat, i) => (
                    <div key={i} className="flex items-center justify-between py-6 border-b border-drakn-graphite/30">
                      <span className="text-xl font-display uppercase tracking-widest text-drakn-muted">{cat}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-drakn-graphite uppercase mt-4">Categories syncing...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. EDITORIAL BRAND STORY */}
      <section className="py-32 overflow-hidden relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="w-full lg:w-1/2 relative">
            <motion.div 
              style={{ y: editorialY1 }}
              className="aspect-[3/4] w-3/4 bg-drakn-charcoal relative z-10"
              onMouseEnter={handleExploreEnter}
              onMouseLeave={handleLeave}
            >
              <OptimizedImage 
                src={content?.editorial?.image1 || "https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=1500&auto=format&fit=crop"} 
                alt="Editorial Primary" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-80"
              />
            </motion.div>
            <motion.div 
              style={{ y: editorialY2 }}
              className="aspect-[4/5] w-1/2 bg-drakn-graphite absolute -bottom-16 -right-4 md:-right-12 z-20 shadow-2xl shadow-black"
            >
              <OptimizedImage 
                src={content?.editorial?.image2 || "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?q=80&w=1000&auto=format&fit=crop"} 
                alt="Editorial Secondary" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-90"
              />
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 mt-24 lg:mt-0">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-drakn-muted mb-8">The Philosophy</h2>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-wider leading-[1.1] mb-12"
            >
              {content?.editorial?.title || (
                <>Architecture <br /><span className="text-drakn-muted">In Motion</span></>
              )}
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm leading-relaxed text-drakn-muted max-w-md mb-12"
            >
              {content?.editorial?.body || "We construct garments with the same rigorous principles used in modern architecture. Eradicating the superfluous to reveal pure structure. Our materials are uncompromising, our silhouettes sharp, our palette strictly defined."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to="/about" 
                className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] border-b border-drakn-light pb-2 hover:text-drakn-muted hover:border-drakn-muted transition-colors"
                onMouseEnter={handleViewEnter}
                onMouseLeave={handleLeave}
              >
                Discover DRAKN
              </Link>
            </motion.div>
          </div>
          
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto bg-drakn-base">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-display uppercase tracking-widest mb-4">Signatures</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-drakn-muted">Most acquired pieces</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-drakn-charcoal" />)}
          </div>
        ) : bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {bestSellers.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : null}
        
        {/* If no best sellers (like empty DB), show nothing to maintain minimal aesthetic */}
      </section>

      {/* 6. FINAL BRAND STATEMENT / CTA */}
      <section className="h-[70vh] flex flex-col items-center justify-center bg-drakn-light text-drakn-base text-center px-6 border-t border-drakn-graphite">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h2 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-8 leading-none">
            Define <br /> Your Form
          </h2>
          <p className="text-sm font-medium uppercase tracking-[0.2em] mb-12">
            The collection is available globally.
          </p>
          <Link 
            to="/shop"
            onMouseEnter={handleExploreEnter}
            onMouseLeave={handleLeave}
            className="inline-flex items-center justify-center bg-drakn-base text-drakn-light text-xs font-bold uppercase tracking-[0.2em] px-12 py-5 hover:bg-drakn-charcoal transition-colors"
          >
            Enter Store
          </Link>
        </motion.div>
      </section>
      
    </div>
    </PageTransition>
  );
}
