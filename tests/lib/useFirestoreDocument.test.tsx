import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useFirestoreDocument } from '@/lib/useFirestoreDocument';

const getDocMock = vi.fn();
const setDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  setDoc: (...args: unknown[]) => setDocMock(...args),
}));

interface Profiel {
  naam: string;
}

function makeSnapshot(data: Record<string, unknown> | null) {
  return {
    exists: () => data !== null,
    data: () => data,
  };
}

function TestConsumer({ seed }: { seed?: Profiel }) {
  const { data, error, save } = useFirestoreDocument<Profiel>('instellingen', 'profiel', { seed });
  return (
    <div>
      <div data-testid="data">{data === null ? 'loading' : data.naam}</div>
      <div data-testid="error">{error ?? 'none'}</div>
      <button type="button" data-testid="save" onClick={() => save({ naam: 'Aangepast' })} />
    </div>
  );
}

beforeEach(() => {
  getDocMock.mockReset();
  setDocMock.mockReset();
});

describe('useFirestoreDocument', () => {
  it('fetches and exposes the document data', async () => {
    getDocMock.mockResolvedValue(makeSnapshot({ naam: 'Een' }));
    render(<TestConsumer />);
    expect(screen.getByTestId('data')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('Een'));
    expect(getDocMock).toHaveBeenCalledWith({ collectionName: 'instellingen', id: 'profiel' });
  });

  it('sets a load error when getDoc fails', async () => {
    getDocMock.mockRejectedValue(new Error('offline'));
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('load'));
  });

  it('seeds the document when it does not exist and a seed is given', async () => {
    getDocMock.mockResolvedValue(makeSnapshot(null));
    setDocMock.mockResolvedValue(undefined);
    render(<TestConsumer seed={{ naam: 'Seed' }} />);
    await waitFor(() =>
      expect(setDocMock).toHaveBeenCalledWith({ collectionName: 'instellingen', id: 'profiel' }, { naam: 'Seed' })
    );
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('Seed'));
  });

  it('does not seed when the document is missing and no seed is given', async () => {
    getDocMock.mockResolvedValue(makeSnapshot(null));
    render(<TestConsumer />);
    await waitFor(() => expect(getDocMock).toHaveBeenCalled());
    expect(setDocMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('data')).toHaveTextContent('loading');
  });

  it('saves data and exposes it immediately', async () => {
    getDocMock.mockResolvedValue(makeSnapshot({ naam: 'Een' }));
    setDocMock.mockResolvedValue(undefined);
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('Een'));
    fireEvent.click(screen.getByTestId('save'));
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('Aangepast'));
    expect(setDocMock).toHaveBeenCalledWith({ collectionName: 'instellingen', id: 'profiel' }, { naam: 'Aangepast' });
  });

  it('sets an action error and keeps existing data when save fails', async () => {
    getDocMock.mockResolvedValue(makeSnapshot({ naam: 'Een' }));
    setDocMock.mockRejectedValue(new Error('offline'));
    render(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('Een'));
    fireEvent.click(screen.getByTestId('save'));
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('action'));
    expect(screen.getByTestId('data')).toHaveTextContent('Een');
  });
});
