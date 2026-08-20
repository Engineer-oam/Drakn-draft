import { useState, useMemo } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { ProductCard } from '../components/shop/ProductCard';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PageTransition } from '../components/PageTransition';

export function Shop() {
  const { products, loading } = useCatalog();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);

  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.categoryId).filter(Boolean)));
    const colors = Array.from(new Set(products.flatMap(p => p.colors).filter(Boolean)));
    const sizes = Array.from(new Set(products.flatMap(p => p.sizes).filter(Boolean)));
    const fits = Array.from(new Set(products.map(p => p.fit).filter(Boolean)));
    return { categories, colors, sizes, fits };
  }, [products]);

  const toggleFilter = (list: string[], setList: (l: string[]) => void, value: string) => {
    if (list.includes(value)) setList(list.filter(item => item !== value));
    else setList([...list, value]);
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.categoryId));
    }
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors.some(c => selectedColors.includes(c)));
    }
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }
    if (selectedFits.length > 0) {
      result = result.filter(p => selectedFits.includes(p.fit));
    }

    // Sorting
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.priceRange.min - b.priceRange.min);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.priceRange.min - a.priceRange.min);
    } else {
      // newest (default)
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [products, selectedCategories, selectedColors, selectedSizes, selectedFits, sortBy]);

  const activeFiltersCount = selectedCategories.length + selectedColors.length + selectedSizes.length + selectedFits.length;

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-32 px-8 flex flex-col">
          <div className="h-8 w-48 bg-drakn-dark animate-pulse mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-[3/4] bg-drakn-dark animate-pulse"></div>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-32">
      
      {/* Header & Controls */}
      <div className="px-6 md:px-12 mb-12 sticky top-16 z-30 bg-drakn-base/90 backdrop-blur-md py-4 border-b border-transparent transition-all">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-display uppercase tracking-[0.1em]">Catalog</h1>
            <p className="text-xs uppercase tracking-widest text-drakn-muted mt-4">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-drakn-muted transition-colors border border-drakn-graphite px-4 py-3"
            >
              <SlidersHorizontal size={14} />
              Filter {activeFiltersCount > 0 && <span className="bg-drakn-light text-drakn-base px-1.5 font-bold rounded-full">{activeFiltersCount}</span>}
            </button>
            
            <div className="relative border border-drakn-graphite px-4 py-3 group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent text-xs uppercase tracking-widest pr-6 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-drakn-base">Newest</option>
                <option value="price-low" className="bg-drakn-base">Price: Low to High</option>
                <option value="price-high" className="bg-drakn-base">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-drakn-muted" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 flex flex-col lg:flex-row gap-12">
        
        {/* Filters Sidebar */}
        <AnimatePresence>
          {(isFilterOpen || window.innerWidth > 1024) && (
            <motion.aside 
              initial={{ opacity: 0, width: 0, x: -20 }}
              animate={{ opacity: 1, width: 280, x: 0 }}
              exit={{ opacity: 0, width: 0, x: -20 }}
              className={cn(
                "lg:block shrink-0",
                !isFilterOpen ? "hidden" : "block w-full lg:w-[280px]"
              )}
            >
              <div className="sticky top-40 space-y-10 pr-6">
                
                {filterOptions.categories.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-drakn-muted mb-4 border-b border-drakn-graphite pb-2">Category</h3>
                    <div className="space-y-3">
                      {filterOptions.categories.map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn("w-3 h-3 border border-drakn-graphite flex items-center justify-center transition-colors group-hover:border-drakn-light", selectedCategories.includes(cat) && "bg-drakn-light border-drakn-light")}>
                            {selectedCategories.includes(cat) && <X size={10} className="text-drakn-base" />}
                          </div>
                          <span className={cn("text-xs uppercase tracking-widest transition-colors", selectedCategories.includes(cat) ? "text-drakn-light" : "text-drakn-muted group-hover:text-drakn-light")}>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filterOptions.sizes.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-drakn-muted mb-4 border-b border-drakn-graphite pb-2">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                          className={cn(
                            "w-10 h-10 border flex items-center justify-center text-xs uppercase tracking-widest transition-colors",
                            selectedSizes.includes(size) ? "border-drakn-light bg-drakn-light text-drakn-base font-bold" : "border-drakn-graphite text-drakn-muted hover:border-drakn-light hover:text-drakn-light"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filterOptions.colors.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-drakn-muted mb-4 border-b border-drakn-graphite pb-2">Colour</h3>
                    <div className="space-y-3">
                      {filterOptions.colors.map(color => (
                        <label key={color} className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn("w-3 h-3 border border-drakn-graphite flex items-center justify-center transition-colors group-hover:border-drakn-light", selectedColors.includes(color) && "bg-drakn-light border-drakn-light")}>
                            {selectedColors.includes(color) && <X size={10} className="text-drakn-base" />}
                          </div>
                          <span className={cn("text-xs uppercase tracking-widest transition-colors", selectedColors.includes(color) ? "text-drakn-light" : "text-drakn-muted group-hover:text-drakn-light")}>{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center border border-dashed border-drakn-graphite text-center p-6">
              <h2 className="text-xl font-display uppercase tracking-widest mb-4">No Results</h2>
              <p className="text-sm text-drakn-muted max-w-md">Try adjusting your filters or browse the complete collection.</p>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={() => {
                    setSelectedCategories([]); setSelectedColors([]); setSelectedSizes([]); setSelectedFits([]);
                  }}
                  className="mt-6 text-xs uppercase tracking-widest border-b border-drakn-light pb-1 hover:text-drakn-muted hover:border-drakn-muted transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-16">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
    </PageTransition>
  );
}
