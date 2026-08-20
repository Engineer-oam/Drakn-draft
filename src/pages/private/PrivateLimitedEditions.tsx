import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PageTransition } from '../../components/PageTransition';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { OptimizedImage } from '../../components/OptimizedImage';

export function PrivateLimitedEditions() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEditions() {
      try {
        const q = query(
          collection(db, 'products'),
          where('isPrivate', '==', true),
          where('privateType', '==', 'limited_edition')
        );
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEditions();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050505] text-[#D4CFC9] pt-32 pb-24 px-6 md:px-12 selection:bg-[#F4F0EB] selection:text-[#050505]">
        <header className="max-w-[1600px] mx-auto mb-32 md:text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-display uppercase tracking-[0.2em] text-white mb-6"
          >
            Limited Editions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xs uppercase tracking-[0.2em] text-[#A39E98] max-w-lg mx-auto leading-relaxed"
          >
            Strictly limited production runs. Each piece is numbered and certificated.
          </motion.p>
        </header>

        <div className="max-w-[1200px] mx-auto">
          {loading ? (
             <div className="flex justify-center p-24">
               <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div>
             </div>
          ) : products.length === 0 ? (
            <div className="border border-[#1A1A1A] p-24 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[#A39E98]">
                No limited editions currently available.
              </p>
            </div>
          ) : (
            <div className="space-y-32">
              {products.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
                >
                  <div className={`col-span-1 md:col-span-7 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                    <Link to={`/private/request/${product.id}`} className="block group">
                      <div className="aspect-[4/5] bg-[#0A0A0A] overflow-hidden relative">
                        {product.images?.[0] ? (
                          <OptimizedImage 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                          />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-[#333] text-[10px] uppercase tracking-widest">
                             Visual Confidential
                           </div>
                        )}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <span className="bg-white text-black px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
                            {product.editionStatus || 'AVAILABLE'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className={`col-span-1 md:col-span-5 ${idx % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="pl-0 md:px-12">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#A39E98] mb-4">
                        {product.editionInfo?.name || `EDITION ${idx + 1}`}
                      </h4>
                      <h2 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-white mb-6">
                        {product.name}
                      </h2>
                      <div className="space-y-6 mb-12">
                        <div className="flex justify-between border-b border-[#1A1A1A] pb-3 text-xs uppercase tracking-widest">
                          <span className="text-[#A39E98]">Limitation</span>
                          <span className="text-white">{product.editionInfo?.remaining || 0} / {product.editionInfo?.quantity || 'XX'}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1A1A1A] pb-3 text-xs uppercase tracking-widest">
                          <span className="text-[#A39E98]">Release</span>
                          <span className="text-white">{product.editionInfo?.releaseDate || 'TBA'}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#1A1A1A] pb-3 text-xs uppercase tracking-widest">
                          <span className="text-[#A39E98]">Price</span>
                          <span className="text-white">{product.price ? `$${product.price.toLocaleString()}` : 'Price on Request'}</span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/private/request/${product.id}`}
                        className="inline-block border border-white text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                      >
                        {product.editionStatus === 'SOLD OUT' ? 'View Archive' : 'Request Allocation'}
                      </Link>
                    </div>
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
