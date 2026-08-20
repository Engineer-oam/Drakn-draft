import { Link } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { PageTransition } from '../components/PageTransition';
import { OptimizedImage } from '../components/OptimizedImage';
import { useStore } from '../store';
import { ArrowRight } from 'lucide-react';

export function Collections() {
  const { collections, loading } = useCollections();
  const { setCursorVariant } = useStore();

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-32 px-8 flex justify-center">
          <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-32 max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="text-4xl md:text-6xl font-display uppercase tracking-widest mb-16 border-b border-drakn-light/20 pb-8">
          Collections
        </h1>

        {collections.length === 0 ? (
          <div className="text-drakn-muted uppercase tracking-widest text-sm text-center py-20">
            No collections available at this time.
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {collections.map(collection => (
              <div key={collection.id} className="flex flex-col md:flex-row gap-12 items-center">
                <div 
                  className="w-full md:w-1/2 aspect-[4/5] md:aspect-square bg-drakn-dark relative overflow-hidden group cursor-none"
                  onMouseEnter={() => setCursorVariant('view')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  <Link to={`/collection/${collection.slug}`}>
                    {collection.image ? (
                      <OptimizedImage 
                        src={collection.image} 
                        alt={collection.name} 
                        className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-drakn-muted uppercase text-xs tracking-widest">
                        No Image
                      </div>
                    )}
                  </Link>
                </div>
                <div className="w-full md:w-1/2">
                  <h2 className="text-3xl md:text-5xl font-display uppercase tracking-widest mb-6">
                    {collection.name}
                  </h2>
                  <p className="text-sm text-drakn-muted leading-relaxed mb-8 max-w-md">
                    {collection.description}
                  </p>
                  <Link 
                    to={`/collection/${collection.slug}`}
                    className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] border border-drakn-light px-8 py-4 hover:bg-drakn-light hover:text-drakn-base transition-colors"
                  >
                    View Collection <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
