import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productIds: string[];
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'collections'));
      setCollections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const saveCollection = async (coll: Omit<Collection, 'id'>, id?: string) => {
    try {
      const docRef = id ? doc(db, 'collections', id) : doc(collection(db, 'collections'));
      await setDoc(docRef, coll);
      fetchCollections();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'collections', id));
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return { collections, loading, saveCollection, deleteCollection };
}
