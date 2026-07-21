'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UseFirestoreCollectionOptions<T> {
  seed?: Omit<T, 'id'>[];
  skip?: boolean;
}

export interface UseFirestoreCollectionResult<T> {
  items: T[] | null;
  error: 'load' | 'action' | null;
  add: (data: Omit<T, 'id'>) => Promise<boolean>;
  update: (id: string, data: Partial<Omit<T, 'id'>>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refetch: () => Promise<boolean>;
}

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  options?: UseFirestoreCollectionOptions<T>
): UseFirestoreCollectionResult<T> {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<'load' | 'action' | null>(null);
  const seedRef = useRef(options?.seed);
  seedRef.current = options?.seed;

  const fetchItems = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      let docs = snapshot.docs;
      const seed = seedRef.current;
      if (snapshot.empty && seed && seed.length > 0) {
        for (const seedItem of seed) {
          await addDoc(collection(db, collectionName), seedItem);
        }
        const reseeded = await getDocs(collection(db, collectionName));
        docs = reseeded.docs;
      }
      setItems(docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as T));
      setError(null);
      return true;
    } catch {
      setError('load');
      return false;
    }
  }, [collectionName]);

  useEffect(() => {
    if (options?.skip) {
      return;
    }
    fetchItems();
  }, [fetchItems, options?.skip]);

  const add = useCallback(
    async (data: Omit<T, 'id'>) => {
      try {
        await addDoc(collection(db, collectionName), data);
        await fetchItems();
        return true;
      } catch {
        setError('action');
        return false;
      }
    },
    [collectionName, fetchItems]
  );

  const update = useCallback(
    async (id: string, data: Partial<Omit<T, 'id'>>) => {
      try {
        await updateDoc(doc(db, collectionName, id), data);
        await fetchItems();
        return true;
      } catch {
        setError('action');
        return false;
      }
    },
    [collectionName, fetchItems]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, collectionName, id));
        await fetchItems();
        return true;
      } catch {
        setError('action');
        return false;
      }
    },
    [collectionName, fetchItems]
  );

  return { items, error, add, update, remove, refetch: fetchItems };
}
