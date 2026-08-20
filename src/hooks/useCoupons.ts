import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  expiry?: number;
  usageLimit?: number;
  currentUsage: number;
  perCustomerLimit?: number;
  active: boolean;
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'coupons'));
      setCoupons(snapshot.docs.map(doc => ({ code: doc.id, ...doc.data() } as Coupon)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const saveCoupon = async (coupon: Coupon) => {
    try {
      await setDoc(doc(db, 'coupons', coupon.code.toUpperCase()), {
        ...coupon,
        code: coupon.code.toUpperCase()
      });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteCoupon = async (code: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', code));
      setCoupons(prev => prev.filter(c => c.code !== code));
    } catch (err) {
      console.error(err);
    }
  };

  return { coupons, loading, saveCoupon, deleteCoupon };
}
