import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useFirestoreCollection } from '@/lib/useFirestoreCollection';

const getDocsMock = vi.fn();
const addDocMock = vi.fn();
const updateDocMock = vi.fn();
const deleteDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  addDoc: (...args: unknown[]) => addDocMock(...args),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...args),
}));

function makeSnapshot(docsData: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    empty: docsData.length === 0,
    docs: docsData.map(({ id, data }) => ({ id, data: () => data })),
  };
}

interface Item {
  id: string;
  naam: string;
}

function TestConsumer({ seed, skip }: { seed?: Omit<Item, 'id'>[]; skip?: boolean }) {
  const { items, error, add, update, remove } = useFirestoreCollection<Item>('dingen', { seed, skip });
  return (
    <div>
      <div data-testid="items">
        {items === null ? 'loading' : items.length === 0 ? 'empty' : items.map((item) => item.naam).join(',')}
      </div>
      <div data-testid="error">{error ?? 'none'}</div>
      <button type="button" data-testid="add" onClick={() => add({ naam: 'Nieuw' })} />
      <button
        type="button"
        data-testid="update"
        onClick={() => update(items?.[0]?.id ?? '', { naam: 'Aangepast' })}
      />
      <button type="button" data-testid="remove" onClick={() => remove(items?.[0]?.id ?? '')} />
    </div>
  );
}

beforeEach(() => {
  getDocsMock.mockReset();
  addDocMock.mockReset();
  updateDocMock.mockReset();
  deleteDocMock.mockReset();
});

describe('useFirestoreCollection', () => {
  it('fetches and exposes items with the Firestore doc id spread in', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot([{ id: 'a', data: { naam: 'Een' } }]));
    render(<TestConsumer />);
    expect(screen.getByTestId('items')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Een'));
  });

  it('sets a load error when getDocs fails', async () => {
    getDocsMock.mockRejectedValue(new Error('offline'));
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('load'));
  });

  it('seeds the collection when it is empty and a seed is given, then exposes the seeded items', async () => {
    getDocsMock
      .mockResolvedValueOnce(makeSnapshot([]))
      .mockResolvedValueOnce(makeSnapshot([{ id: 'seeded-1', data: { naam: 'Seed' } }]));
    addDocMock.mockResolvedValue({ id: 'seeded-1' });
    render(<TestConsumer seed={[{ naam: 'Seed' }]} />);
    await waitFor(() => expect(addDocMock).toHaveBeenCalledWith({ name: 'dingen' }, { naam: 'Seed' }));
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Seed'));
  });

  it('does not seed an empty collection when no seed is given', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot([]));
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('empty'));
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('does not fetch while skip is true', () => {
    render(<TestConsumer seed={[{ naam: 'Seed' }]} skip />);
    expect(getDocsMock).not.toHaveBeenCalled();
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('adds an item and refetches', async () => {
    getDocsMock
      .mockResolvedValueOnce(makeSnapshot([]))
      .mockResolvedValueOnce(makeSnapshot([{ id: 'new-1', data: { naam: 'Nieuw' } }]));
    addDocMock.mockResolvedValue({ id: 'new-1' });
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('empty'));
    fireEvent.click(screen.getByTestId('add'));
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Nieuw'));
  });

  it('updates an item and refetches', async () => {
    getDocsMock
      .mockResolvedValueOnce(makeSnapshot([{ id: 'a', data: { naam: 'Een' } }]))
      .mockResolvedValueOnce(makeSnapshot([{ id: 'a', data: { naam: 'Aangepast' } }]));
    updateDocMock.mockResolvedValue(undefined);
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Een'));
    fireEvent.click(screen.getByTestId('update'));
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Aangepast'));
    expect(updateDocMock).toHaveBeenCalledWith({ collectionName: 'dingen', id: 'a' }, { naam: 'Aangepast' });
  });

  it('removes an item and refetches', async () => {
    getDocsMock
      .mockResolvedValueOnce(makeSnapshot([{ id: 'a', data: { naam: 'Een' } }]))
      .mockResolvedValueOnce(makeSnapshot([]));
    deleteDocMock.mockResolvedValue(undefined);
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Een'));
    fireEvent.click(screen.getByTestId('remove'));
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('empty'));
  });

  it('sets an action error and keeps existing items when add fails', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot([{ id: 'a', data: { naam: 'Een' } }]));
    addDocMock.mockRejectedValue(new Error('offline'));
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Een'));
    fireEvent.click(screen.getByTestId('add'));
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('action'));
    expect(screen.getByTestId('items')).toHaveTextContent('Een');
  });
});
