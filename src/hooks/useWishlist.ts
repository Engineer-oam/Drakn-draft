import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { CatalogProduct } from './useCatalog';

export interface WishlistItem {
  productId: string;
  variantId?: string;
  addedAt: number;
}

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const wishlistRef = collection(db, 'wishlists', user.uid, 'items');
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        productId: doc.data().productId,
        variantId: doc.data().variantId,
        addedAt: doc.data().addedAt
      })) as WishlistItem[];
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching wishlist:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addToWishlist = useCallback(async (productId: string, variantId?: string) => {
    if (!user) return;
    const itemRef = doc(db, 'wishlists', user.uid, 'items', variantId ? `${productId}_${variantId}` : productId);
    await setDoc(itemRef, {
      productId,
      variantId: variantId || null,
      addedAt: Date.now()
    });
  }, [user]);

  const removeFromWishlist = useCallback(async (productId: string, variantId?: string) => {
    if (!user) return;
    const itemRef = doc(db, 'wishlists', user.uid, 'items', variantId ? `${productId}_${variantId}` : productId);
    await deleteDoc(itemRef);
  }, [user]);

  const isInWishlist = useCallback((productId: string, variantId?: string) => {
    return items.some(item => 
      item.productId === productId && (!variantId || item.variantId === variantId)
    );
  }, [items]);

  return { items, loading, addToWishlist, removeFromWishlist, isInWishlist };
}
