import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, setDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Order {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: number;
  items: any[];
}

export function useCustomer() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setOrders([]);
      setLoading(false);
      return;
    }

    async function fetchCustomerData() {
      try {
        setLoading(true);
        // Profile
        const profileRef = doc(db, 'users', user!.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        } else {
          // Initialize empty profile
          const initProfile = { email: user!.email, addresses: [], settings: {} };
          await setDoc(profileRef, initProfile);
          setProfile(initProfile);
        }

        // Orders
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user!.uid), orderBy('createdAt', 'desc'));
        const ordersSnap = await getDocs(ordersQuery);
        
        const ordersData: Order[] = [];
        for (const oDoc of ordersSnap.docs) {
          const oData = oDoc.data();
          const itemsQuery = collection(db, 'orders', oDoc.id, 'items');
          const itemsSnap = await getDocs(itemsQuery);
          
          ordersData.push({
            id: oDoc.id,
            ...oData,
            items: itemsSnap.docs.map(i => i.data())
          } as Order);
        }
        
        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching customer data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [user]);

  const updateProfile = async (updates: any) => {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid);
    await setDoc(profileRef, updates, { merge: true });
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return { profile, orders, loading, updateProfile };
}
