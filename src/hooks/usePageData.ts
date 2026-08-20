import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PageData {
  title: string;
  subtitle?: string;
  sections: {
    heading?: string;
    body: string;
  }[];
  updatedAt?: any;
}

export function usePageData(pageId: string) {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      try {
        const docRef = doc(db, 'pages', pageId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as PageData);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error(`Error fetching page ${pageId}:`, error);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [pageId]);

  return { data, loading };
}
