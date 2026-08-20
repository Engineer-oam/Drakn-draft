import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { CatalogProduct } from '../../hooks/useCatalog';
import { useState } from 'react';
import { useStore } from '../../store';
import { useWishlist } from '../../hooks/useWishlist';
import { OptimizedImage } from '../OptimizedImage';

export function ProductCard({ product, index }: { product: CatalogProduct, index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { setCursorVariant } = useStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const primaryImage = product.images[0]?.url;
  const secondaryImage = product.images[1]?.url || primaryImage;
  const inWishlist = isInWishlist(product.id, product.variants[0]?.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id, product.variants[0]?.id);
    } else {
      addToWishlist(product.id, product.variants[0]?.id);
    }
  };

  const priceDisplay = product.priceRange.min === product.priceRange.max
    ? formatPrice(product.priceRange.min)
    : `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={`/product/${product.id}`} 
        className="block relative aspect-[3/4] overflow-hidden bg-drakn-dark mb-4 cursor-none"
        onMouseEnter={() => setCursorVariant('view')}
        onMouseLeave={() => setCursorVariant('default')}
      >
        {primaryImage ? (
          <>
            <OptimizedImage 
              src={primaryImage} 
              alt={product.name} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out mix-blend-luminosity hover:mix-blend-normal ${isHovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'}`}
            />
            {secondaryImage !== primaryImage && (
              <OptimizedImage 
                src={secondaryImage} 
                alt={`${product.name} alternate`} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out mix-blend-luminosity hover:mix-blend-normal ${isHovered ? 'opacity-100' : 'opacity-0 scale-105'}`}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-drakn-muted text-[10px] uppercase tracking-widest">
            No Image
          </div>
        )}

        <button 
          className="absolute top-4 right-4 p-2 z-10 text-drakn-base bg-drakn-light/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-drakn-light lg:block hidden rounded-full"
          onClick={toggleWishlist}
          onMouseEnter={() => setCursorVariant('hover')}
          onMouseLeave={() => setCursorVariant('default')}
        >
          <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
        </button>
        
        {/* Mobile wishlist button always visible slightly */}
        <button 
          className="absolute top-4 right-4 p-2 z-10 text-drakn-base bg-drakn-light/90 lg:hidden rounded-full"
          onClick={toggleWishlist}
        >
          <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </Link>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-1">
          <h3 className="text-sm font-bold tracking-wide group-hover:text-drakn-muted transition-colors line-clamp-1">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <span className="text-xs tracking-widest shrink-0">{priceDisplay}</span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] uppercase tracking-widest text-drakn-muted">
            {product.colors.length} {product.colors.length === 1 ? 'Colour' : 'Colours'}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-drakn-graphite">
            {product.fit}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
