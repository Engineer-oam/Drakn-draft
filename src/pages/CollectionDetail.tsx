import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { useCatalog } from '../hooks/useCatalog';
import { PageTransition } from '../components/PageTransition';
import { OptimizedImage } from '../components/OptimizedImage';
import { useStore } from '../store';

export function CollectionDetail() {
  const { slug } = useParams();
  const { collections, loading: loadingCol } = useCollections();
  const { products, loading: loadingProd } = useCatalog();
  const { setCursorVariant } = useStore();

  const collection = collections.find(c => c.slug === slug);
  const collectionProducts = products.filter(p => collection?.productIds.includes(p.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  if (loadingCol || loadingProd) {
    return <PageTransition><div className="min-h-screen pt-32 flex justify-center"><div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div></div></PageTransition>;
  }

  if (!collection) {
    return <PageTransition><div className="min-h-screen pt-32 px-8 flex justify-center uppercase tracking-widest text-sm text-drakn-muted">Collection not found</div></PageTransition>;
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16 border-b border-drakn-light/20 pb-8 text-center md:text-left flex flex-col md:flex-row gap-8 items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-6xl font-display uppercase tracking-widest mb-4">
              {collection.name}
            </h1>
            <p className="text-sm text-drakn-muted max-w-xl leading-relaxed">
              {collection.description}
            </p>
          </div>
          <div className="text-xs uppercase tracking-widest text-drakn-muted font-bold shrink-0">
            {collectionProducts.length} Pieces
          </div>
        </div>

        {collectionProducts.length === 0 ? (
          <div className="text-drakn-muted text-sm uppercase tracking-widest text-center py-20 border border-drakn-light/10">
            No products currently available in this collection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {collectionProducts.map(product => (
              <Link 
                key={product.id}
                to={`/product/${product.id}`}
                className="group block"
                onMouseEnter={() => setCursorVariant('view')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <div className="relative aspect-[3/4] bg-drakn-charcoal overflow-hidden mb-4">
                  {product.images?.[0] ? (
                    <OptimizedImage 
                      src={product.images[0].url} 
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-drakn-muted uppercase text-xs tracking-widest">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xs uppercase tracking-widest text-drakn-light font-medium">{product.name}</h3>
                  <span className="text-xs text-drakn-muted">{formatPrice(product.priceRange.min)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
