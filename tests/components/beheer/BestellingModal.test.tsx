import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BestellingModal } from '@/components/beheer/BestellingModal';
import type { Bestelling } from '@/components/beheer/BestellingenSection';
import messages from '../../../messages/nl.json';

const updateDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
}));

const BESTELLING: Bestelling = {
  id: 'header-1',
  klantId: 'uid-1',
  companyName: 'Testbedrijf BV',
  besteldatum: '1-7-2026',
  status: 'Te beoordelen',
  lineCount: 2,
  totalQuantity: 5,
  lines: [
    { id: 'line-1', kunstwerkId: null, maatId: null, materiaalId: null, quantity: 3 },
    { id: 'line-2', kunstwerkId: null, maatId: null, materiaalId: null, quantity: 2 },
  ],
};

function renderModal(bestelling: Bestelling | null) {
  const onClose = vi.fn();
  const onUpdated = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <BestellingModal bestelling={bestelling} onClose={onClose} onUpdated={onUpdated} />
    </NextIntlClientProvider>
  );
  return { onClose, onUpdated };
}

beforeEach(() => {
  updateDocMock.mockReset();
});

describe('BestellingModal', () => {
  it('renders nothing when bestelling is null', () => {
    renderModal(null);
    expect(screen.queryByTestId('bestelling-modal')).not.toBeInTheDocument();
  });

  it('shows the bestelling details and each line with quantity', () => {
    renderModal(BESTELLING);
    expect(screen.getByTestId('bestelling-modal')).toHaveTextContent('Testbedrijf BV');
    expect(screen.getByTestId('bestelling-modal-line-line-1')).toHaveTextContent('×3');
    expect(screen.getByTestId('bestelling-modal-line-line-2')).toHaveTextContent('×2');
    expect(screen.getAllByText('Onbekend')).toHaveLength(2);
  });

  it('approves the bestelling and calls onUpdated with status Goedgekeurd', async () => {
    updateDocMock.mockResolvedValue(undefined);
    const { onUpdated } = renderModal(BESTELLING);
    fireEvent.click(screen.getByTestId('bestelling-modal-goedkeuren'));

    await waitFor(() =>
      expect(updateDocMock).toHaveBeenCalledWith(
        { collectionName: 'bestelheaders', id: 'header-1' },
        { status: 'Goedgekeurd' }
      )
    );
    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith({ ...BESTELLING, status: 'Goedgekeurd' }));
  });

  it('rejects the bestelling and calls onUpdated with status Afgewezen', async () => {
    updateDocMock.mockResolvedValue(undefined);
    const { onUpdated } = renderModal(BESTELLING);
    fireEvent.click(screen.getByTestId('bestelling-modal-afwijzen'));

    await waitFor(() =>
      expect(updateDocMock).toHaveBeenCalledWith(
        { collectionName: 'bestelheaders', id: 'header-1' },
        { status: 'Afgewezen' }
      )
    );
    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith({ ...BESTELLING, status: 'Afgewezen' }));
  });

  it('shows an error and does not call onUpdated when updateDoc fails', async () => {
    updateDocMock.mockRejectedValue(new Error('offline'));
    const { onUpdated } = renderModal(BESTELLING);
    fireEvent.click(screen.getByTestId('bestelling-modal-afwijzen'));

    expect(await screen.findByTestId('bestelling-modal-error')).toBeInTheDocument();
    expect(onUpdated).not.toHaveBeenCalled();
  });
});
