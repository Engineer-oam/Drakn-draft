import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PageTransition } from '../../components/PageTransition';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { OptimizedImage } from '../../components/OptimizedImage';
import { ChevronRight } from 'lucide-react';

export function PrivateMadeToOrder() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMTO() {
      try {
        const q = query(
          collection(db, 'products'),
          where('isPrivate', '==', true),
          where('privateType', '==', 'made_to_order')
        );
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMTO();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050505] text-[#D4CFC9] pt-32 pb-24 px-6 md:px-12 selection:bg-[#F4F0EB] selection:text-[#050505]">
        <header className="max-w-[1600px] mx-auto mb-24 md:text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-display uppercase tracking-[0.2em] text-white mb-6"
          >
            Made To Order
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xs uppercase tracking-[0.2em] text-[#A39E98] max-w-xl mx-auto leading-relaxed"
          >
            Select a silhouette and configure materials, finishes, and precise details. Crafted upon commission.
          </motion.p>
        </header>

        <div className="max-w-[1600px] mx-auto">
          {loading ? (
             <div className="flex justify-center p-24">
               <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div>
             </div>
          ) : products.length === 0 ? (
            <div className="border border-[#1A1A1A] p-24 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[#A39E98]">
                No silhouettes are currently available for configuration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div className="aspect-[3/4] bg-[#0A0A0A] overflow-hidden mb-6 relative">
                    {product.images?.[0] ? (
                      <OptimizedImage 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
                      />
                    ) : (
                       <div className="absolute inset-0 flex items-center justify-center text-[#333] text-[10px] uppercase tracking-widest">
                         Silhouette {idx + 1}
                       </div>
                    )}
                  </div>
                  <div className="border-t border-[#1A1A1A] pt-6 flex justify-between items-start">
                    <div>
                      <h2 className="text-sm md:text-base font-display uppercase tracking-widest text-white mb-2">{product.name}</h2>
                      <p className="text-[10px] uppercase tracking-widest text-[#A39E98]">
                        {product.customizationOptions?.length || 0} Configurable Elements
                      </p>
                    </div>
                    <Link 
                      to={`/private/request/${product.id}`}
                      className="text-white hover:text-[#A39E98] transition-colors p-2 -mr-2"
                    >
                      <ChevronRight size={20} strokeWidth={1} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
