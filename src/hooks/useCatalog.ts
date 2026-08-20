import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  collectionId: string;
  fit: string;
  material: string;
  fabric: string;
  status: string;
  createdAt: number;
  variants: any[];
  images: any[];
  priceRange: { min: number; max: number };
  colors: string[];
  sizes: string[];
}

export function useCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        
        const catalog = await Promise.all(snap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          const pId = pDoc.id;
          
          const vSnap = await getDocs(collection(db, 'products', pId, 'variants'));
          const variants = vSnap.docs.map(v => ({ id: v.id, ...v.data() } as any)).filter((v:any) => v.isActive);
          
          const iSnap = await getDocs(query(collection(db, 'products', pId, 'images'), orderBy('order')));
          const images = iSnap.docs.map(i => ({ id: i.id, ...i.data() }));

          const prices = variants.map(v => v.price);
          const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
          const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));

          return {
            id: pId,
            ...pData,
            variants,
            images,
            priceRange: {
              min: prices.length > 0 ? Math.min(...prices) : 0,
              max: prices.length > 0 ? Math.max(...prices) : 0
            },
            colors,
            sizes
          } as CatalogProduct;
        }));
        
        // Filter out products with no active variants
        setProducts(catalog.filter(p => p.variants.length > 0));
      } catch (err: any) {
        console.error("Error fetching catalog", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  return { products, loading, error };
}
