import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface HomepageContent {
  hero: {
    headline: string;
    subheading: string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
  editorial: {
    title: string;
    body: string;
    image1: string;
    image2: string;
  };
  featuredCollection: {
    title: string;
    image: string;
    link: string;
  };
}

export function useHomepageData() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Homepage Content
        const contentDoc = await getDoc(doc(db, 'settings', 'homepage'));
        if (contentDoc.exists()) {
          setContent(contentDoc.data() as HomepageContent);
        }

        // Fetch New Arrivals (limit 4)
        const productsRef = collection(db, 'products');
        const newQuery = query(productsRef, orderBy('createdAt', 'desc'), limit(4));
        const newSnapshot = await getDocs(newQuery);
        setNewArrivals(newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Fetch Best Sellers (limit 4) - assuming there's a salesCount field
        const bestQuery = query(productsRef, orderBy('salesCount', 'desc'), limit(4));
        const bestSnapshot = await getDocs(bestQuery);
        setBestSellers(bestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Fetch Categories
        const categoriesRef = collection(db, 'categories');
        const catSnapshot = await getDocs(categoriesRef);
        setCategories(catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { content, newArrivals, bestSellers, categories, loading };
}
