import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BESTELNR_PADDING = 5;

export async function generateBestelnr(): Promise<string> {
  const counterRef = doc(db, 'counters', 'bestelnummer');
  const nextValue = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const current = counterSnap.exists() ? ((counterSnap.data().value as number) ?? 0) : 0;
    const next = current + 1;
    transaction.set(counterRef, { value: next });
    return next;
  });
  return `GD-${String(nextValue).padStart(BESTELNR_PADDING, '0')}`;
}
