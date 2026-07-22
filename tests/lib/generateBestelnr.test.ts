import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generateBestelnr } from '@/lib/generateBestelnr';

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

let counterValue: number | undefined;
const setMock = vi.fn((_ref, data: { value: number }) => {
  counterValue = data.value;
});

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  runTransaction: vi.fn(async (_db, updateFn: (transaction: unknown) => unknown) =>
    updateFn({
      get: vi.fn().mockResolvedValue(
        counterValue === undefined
          ? { exists: () => false, data: () => ({}) }
          : { exists: () => true, data: () => ({ value: counterValue }) }
      ),
      set: setMock,
    })
  ),
}));

beforeEach(() => {
  counterValue = undefined;
  setMock.mockClear();
});

describe('generateBestelnr', () => {
  it('starts at GD-00001 when the counter does not exist yet', async () => {
    const bestelnr = await generateBestelnr();
    expect(bestelnr).toBe('GD-00001');
  });

  it('increments the shared counter for each subsequent call', async () => {
    const first = await generateBestelnr();
    const second = await generateBestelnr();
    const third = await generateBestelnr();
    expect([first, second, third]).toEqual(['GD-00001', 'GD-00002', 'GD-00003']);
  });
});
