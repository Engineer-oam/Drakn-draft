import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useCatalog } from '../hooks/useCatalog';
import { useCartStore } from '../store/cartStore';
import { OptimizedImage } from '../components/OptimizedImage';
import { X, ShoppingBag } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export function Wishlist() {
  const { items: wishlistItems, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { products, loading: catalogLoading } = useCatalog();
  const addItem = useCartStore(state => state.addItem);

  const loading = wishlistLoading || catalogLoading;
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  // Map wishlist items to full product data
  const populatedItems = wishlistItems.map(wItem => {
    const product = products.find(p => p.id === wItem.productId);
    if (!product) return null;
    
    const variant = wItem.variantId ? product.variants.find(v => v.id === wItem.variantId) : product.variants[0];
    if (!variant) return null;

    const price = variant.salePrice > 0 ? variant.salePrice : variant.price;

    return {
      wishlistItem: wItem,
      product,
      variant,
      price,
      imageUrl: product.images[0]?.url || ''
    };
  }).filter(Boolean) as any[];

  const handleMoveToCart = (item: any) => {
    addItem({
      productId: item.product.id,
      variantId: item.variant.id,
      name: item.product.name,
      color: item.variant.color,
      size: item.variant.size,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl
    });
    removeFromWishlist(item.product.id, item.wishlistItem.variantId);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12 border-b border-drakn-light/20 pb-6">
          <h1 className="text-3xl font-display uppercase tracking-widest">Wishlist</h1>
          <span className="text-drakn-muted text-sm uppercase tracking-widest">{populatedItems.length} Items</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
          </div>
        ) : populatedItems.length === 0 ? (
          <div className="text-center py-20 text-drakn-muted uppercase tracking-widest">
            <p className="mb-6">Your wishlist is empty.</p>
            <Link to="/shop" className="text-drakn-light border-b border-drakn-light pb-1">Explore Collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {populatedItems.map((item) => (
              <div key={`${item.product.id}_${item.variant.id}`} className="group relative">
                <Link to={`/product/${item.product.id}`} className="block relative aspect-[3/4] bg-drakn-dark mb-4 overflow-hidden">
                  {item.imageUrl && (
                    <OptimizedImage 
                      src={item.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 hover:scale-105"
                    />
                  )}
                </Link>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display uppercase tracking-wider text-sm mb-1">{item.product.name}</h3>
                    <p className="text-xs text-drakn-muted uppercase tracking-widest mb-2">{item.variant.color} / {item.variant.size}</p>
                    <p className="text-sm font-medium">{formatter.format(item.price)}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleMoveToCart(item)}
                      className="w-8 h-8 flex items-center justify-center border border-drakn-light/20 hover:bg-drakn-light hover:text-drakn-base transition-colors"
                      title="Move to Cart"
                    >
                      <ShoppingBag size={14} />
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(item.product.id, item.wishlistItem.variantId)}
                      className="w-8 h-8 flex items-center justify-center border border-drakn-light/20 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-colors"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
