import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedPurchase: boolean;
  createdAt: any;
}

export function useReviews(productId?: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      if (!productId) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, 'reviews'), 
          where('productId', '==', productId),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));

        // Check if user is eligible to review (has purchased)
        if (user) {
          const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const ordersSnap = await getDocs(ordersQuery);
          
          let purchased = false;
          for (const oDoc of ordersSnap.docs) {
            const itemsSnap = await getDocs(collection(db, 'orders', oDoc.id, 'items'));
            if (itemsSnap.docs.some(iDoc => iDoc.data().productId === productId)) {
              purchased = true;
              break;
            }
          }
          setIsEligible(purchased);
        }
      } catch (err) {
        console.error("Error fetching reviews", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productId, user]);

  const submitReview = async (rating: number, text: string) => {
    if (!user || !productId) throw new Error("Must be logged in and on a product page");
    
    await addDoc(collection(db, 'reviews'), {
      productId,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      rating,
      text,
      status: 'pending', // Requires admin approval
      verifiedPurchase: isEligible,
      createdAt: serverTimestamp()
    });
  };

  return { reviews, loading, isEligible, submitReview };
}
