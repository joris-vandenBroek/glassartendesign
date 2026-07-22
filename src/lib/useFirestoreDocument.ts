'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UseFirestoreDocumentOptions<T> {
  seed?: T;
}

export interface UseFirestoreDocumentResult<T> {
  data: T | null;
  error: 'load' | 'action' | null;
  save: (data: T) => Promise<boolean>;
}

export function useFirestoreDocument<T>(
  collectionName: string,
  docId: string,
  options?: UseFirestoreDocumentOptions<T>
): UseFirestoreDocumentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<'load' | 'action' | null>(null);
  const seedRef = useRef(options?.seed);
  seedRef.current = options?.seed;

  const fetchDoc = useCallback(async () => {
    try {
      const ref = doc(db, collectionName, docId);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setData(snapshot.data() as T);
      } else {
        const seed = seedRef.current;
        if (seed) {
          await setDoc(ref, seed as object);
          setData(seed);
        }
      }
      setError(null);
      return true;
    } catch {
      setError('load');
      return false;
    }
  }, [collectionName, docId]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const save = useCallback(
    async (newData: T) => {
      try {
        await setDoc(doc(db, collectionName, docId), newData as object);
        setData(newData);
        setError(null);
        return true;
      } catch {
        setError('action');
        return false;
      }
    },
    [collectionName, docId]
  );

  return { data, error, save };
}
