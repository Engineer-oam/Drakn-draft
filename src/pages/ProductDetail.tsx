import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/cartStore';
import { useStore } from '../store';
import { useWishlist } from '../hooks/useWishlist';
import { ChevronDown, Heart, Info, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { PageTransition } from '../components/PageTransition';
import { ReviewsSection } from '../components/shop/ReviewsSection';
import { OptimizedImage } from '../components/OptimizedImage';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const { setCursorVariant } = useStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [inventories, setInventories] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selections
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const pDoc = await getDoc(doc(db, 'products', id));
        if (!pDoc.exists()) throw new Error('Product not found');
        setProduct({ id: pDoc.id, ...pDoc.data() });

        const vSnap = await getDocs(collection(db, 'products', id, 'variants'));
        const activeVariants: any[] = vSnap.docs.map(v => ({ id: v.id, ...v.data() })).filter((v:any) => v.isActive);
        setVariants(activeVariants);

        const iSnap = await getDocs(query(collection(db, 'products', id, 'images'), orderBy('order')));
        setImages(iSnap.docs.map(i => ({ id: i.id, ...i.data() })));

        // Fetch live inventory for all variants
        const invData: Record<string, number> = {};
        await Promise.all(activeVariants.map(async (v) => {
          const invDoc = await getDoc(doc(db, 'inventory', v.id));
          if (invDoc.exists()) {
            invData[v.id] = invDoc.data().available;
          } else {
            invData[v.id] = 0;
          }
        }));
        setInventories(invData);

        // Pre-select first available color/size if possible
        if (activeVariants.length > 0) {
          const defaultV = activeVariants[0];
          setSelectedColor(defaultV.color);
          setSelectedSize(defaultV.size);
          setSelectedVariant(defaultV);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Update selected variant when color/size changes
  useEffect(() => {
    if (variants.length > 0) {
      const match = variants.find(v => v.color === selectedColor && v.size === selectedSize);
      setSelectedVariant(match || null);
      setQuantity(1); // Reset quantity on variant change
    }
  }, [selectedColor, selectedSize, variants]);

  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setAdding(true);
    try {
      // Re-verify inventory before adding (simulated check here, real check happens at checkout)
      const invDoc = await getDoc(doc(db, 'inventory', selectedVariant.id));
      const currentStock = invDoc.exists() ? invDoc.data().available : 0;
      
      if (currentStock < quantity) {
        alert(`Sorry, only ${currentStock} items left in stock for this variant.`);
        setAdding(false);
        return;
      }

      addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        color: selectedVariant.color,
        size: selectedVariant.size,
        price: selectedVariant.price,
        quantity,
        imageUrl: images[0]?.url || ''
      });
      
    } catch(e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  if (loading) return <PageTransition><div className="min-h-screen pt-32 px-8 flex justify-center"><div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div></div></PageTransition>;
  if (error) return <PageTransition><div className="min-h-screen pt-32 px-8 flex flex-col items-center justify-center text-center"><h1 className="text-4xl font-display uppercase tracking-widest mb-4">Not Found</h1><p className="text-drakn-muted mb-8">{error}</p><button onClick={() => navigate('/shop')} className="border border-drakn-light px-8 py-4 text-xs uppercase tracking-widest">Return to Shop</button></div></PageTransition>;

  const currentStock = selectedVariant ? (inventories[selectedVariant.id] || 0) : 0;
  const isAvailable = currentStock > 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-drakn-base text-drakn-light font-body pt-24 pb-32">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Mobile Title (hidden on desktop) */}
        <div className="lg:hidden mb-8">
          <button onClick={() => navigate('/shop')} className="text-[10px] uppercase tracking-widest text-drakn-muted flex items-center gap-2 mb-6 hover:text-drakn-light">
            <ArrowLeft size={12} /> Back to Catalog
          </button>
          <h1 className="text-3xl font-display uppercase tracking-[0.1em]">{product.name}</h1>
          <p className="text-sm tracking-widest mt-2">{selectedVariant ? formatPrice(selectedVariant.price) : '---'}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
          
          {/* Left: Image Gallery */}
          <div className="flex-1 w-full lg:w-[65%]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={img.id} 
                  className={cn("bg-drakn-dark relative overflow-hidden group cursor-none", idx === 0 ? "md:col-span-2 aspect-[3/4] md:aspect-[4/5]" : "aspect-[3/4]")}
                  onMouseEnter={() => setCursorVariant('view')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  <OptimizedImage src={img.url} alt={`${product.name} - View ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-luminosity hover:mix-blend-normal" />
                </motion.div>
              ))}
              {images.length === 0 && (
                <div className="md:col-span-2 aspect-[4/5] bg-drakn-dark flex items-center justify-center text-drakn-muted text-xs uppercase tracking-widest">
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details Panel (Sticky) */}
          <div className="w-full lg:w-[35%] lg:max-w-md">
            <div className="sticky top-32 space-y-10">
              
              <div className="hidden lg:block">
                <button onClick={() => navigate('/shop')} className="text-[10px] uppercase tracking-widest text-drakn-muted flex items-center gap-2 mb-8 hover:text-drakn-light">
                  <ArrowLeft size={12} /> Back to Catalog
                </button>
                <h1 className="text-4xl font-display uppercase tracking-[0.1em] leading-tight">{product.name}</h1>
                <p className="text-lg tracking-widest mt-4 text-drakn-graphite">{selectedVariant ? formatPrice(selectedVariant.price) : '---'}</p>
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-drakn-muted">Colour</span>
                    <span className="text-[10px] uppercase tracking-widest">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(c => {
                      const isSelected = selectedColor === c;
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={cn(
                            "px-4 py-3 text-xs uppercase tracking-widest border transition-colors",
                            isSelected ? "border-drakn-light bg-drakn-light text-drakn-base font-bold" : "border-drakn-graphite text-drakn-muted hover:border-drakn-light"
                          )}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-drakn-muted">Size</span>
                    <button className="text-[10px] uppercase tracking-widest text-drakn-muted underline underline-offset-4 flex items-center gap-1 hover:text-drakn-light">
                      <Info size={12}/> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => {
                      // Check if this size is available in the selected color
                      const variantForThisSize = variants.find(v => v.color === selectedColor && v.size === s);
                      const isSizeAvailable = variantForThisSize && (inventories[variantForThisSize.id] || 0) > 0;
                      const isSelected = selectedSize === s;

                      return (
                        <button
                          key={s}
                          onClick={() => isSizeAvailable && setSelectedSize(s)}
                          disabled={!isSizeAvailable}
                          className={cn(
                            "w-14 h-14 border flex items-center justify-center text-xs uppercase tracking-widest transition-colors relative",
                            isSelected ? "border-drakn-light bg-drakn-light text-drakn-base font-bold" : 
                            isSizeAvailable ? "border-drakn-graphite text-drakn-muted hover:border-drakn-light hover:text-drakn-light" : 
                            "border-drakn-graphite/30 text-drakn-graphite/30 cursor-not-allowed"
                          )}
                        >
                          {!isSizeAvailable && <div className="absolute inset-0 w-full h-[1px] bg-drakn-graphite/50 top-1/2 -translate-y-1/2 rotate-45" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart Actions */}
              <div className="pt-6 border-t border-drakn-graphite">
                {selectedVariant ? (
                  isAvailable ? (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-center">
                        <div className="border border-drakn-graphite flex items-center shrink-0">
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-4 text-drakn-muted hover:text-drakn-light">-</button>
                          <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                          <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} className="px-4 py-4 text-drakn-muted hover:text-drakn-light">+</button>
                        </div>
                        <button 
                          onClick={handleAddToCart}
                          disabled={adding}
                          className="flex-1 bg-drakn-light text-drakn-base font-bold text-xs uppercase tracking-widest py-4 hover:bg-drakn-muted transition-colors disabled:opacity-50"
                        >
                          {adding ? 'Adding...' : 'Add to Bag'}
                        </button>
                        <button
                          onClick={() => {
                            const vId = selectedVariant?.id || variants[0]?.id;
                            if (isInWishlist(product.id, vId)) {
                              removeFromWishlist(product.id, vId);
                            } else {
                              addToWishlist(product.id, vId);
                            }
                          }}
                          className="px-4 py-4 border border-drakn-graphite text-drakn-muted hover:text-drakn-light hover:border-drakn-light transition-colors"
                        >
                          <Heart size={20} fill={isInWishlist(product.id, selectedVariant?.id || variants[0]?.id) ? "currentColor" : "none"} strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-[10px] text-green-500 uppercase tracking-widest text-center">In Stock ({currentStock} available)</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button disabled className="w-full bg-drakn-dark border border-drakn-graphite text-drakn-muted text-xs uppercase tracking-widest py-4 cursor-not-allowed">
                        Out of Stock
                      </button>
                      <button className="w-full bg-transparent border-b border-drakn-graphite text-drakn-light text-[10px] uppercase tracking-widest py-3 hover:border-drakn-light transition-colors">
                        Notify me when available
                      </button>
                    </div>
                  )
                ) : (
                  <button disabled className="w-full bg-drakn-dark border border-drakn-graphite text-drakn-muted text-xs uppercase tracking-widest py-4 cursor-not-allowed">
                    Select Configuration
                  </button>
                )}
              </div>

              {/* Accordion Details */}
              <div className="pt-8 space-y-0 divide-y divide-drakn-graphite border-t border-drakn-graphite">
                
                <details className="group" open>
                  <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-6 text-xs uppercase tracking-widest">
                    <span>Details</span>
                    <span className="transition group-open:rotate-180">
                      <ChevronDown size={16} />
                    </span>
                  </summary>
                  <div className="text-sm text-drakn-muted leading-relaxed pb-6 space-y-4">
                    <p>{product.description}</p>
                    <ul className="space-y-2 text-xs">
                      {product.fit && <li><span className="text-drakn-light">Fit:</span> {product.fit}</li>}
                      {product.material && <li><span className="text-drakn-light">Material:</span> {product.material}</li>}
                      {product.fabric && <li><span className="text-drakn-light">Fabric:</span> {product.fabric}</li>}
                    </ul>
                  </div>
                </details>

                {product.careInstructions && (
                  <details className="group">
                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-6 text-xs uppercase tracking-widest">
                      <span>Care Instructions</span>
                      <span className="transition group-open:rotate-180">
                        <ChevronDown size={16} />
                      </span>
                    </summary>
                    <div className="text-sm text-drakn-muted leading-relaxed pb-6 whitespace-pre-wrap">
                      {product.careInstructions}
                    </div>
                  </details>
                )}
                
                <details className="group">
                  <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-6 text-xs uppercase tracking-widest">
                    <span>Shipping & Returns</span>
                    <span className="transition group-open:rotate-180">
                      <ChevronDown size={16} />
                    </span>
                  </summary>
                  <div className="text-sm text-drakn-muted leading-relaxed pb-6">
                    Complimentary standard shipping on all orders. Returns are accepted within 30 days of delivery for unworn items in perfect condition with original tags attached.
                  </div>
                </details>

              </div>

            </div>
          </div>
          
        </div>
        
        <ReviewsSection productId={product.id} />
        
      </div>
    </div>
    </PageTransition>
  );
}
