import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BestellingModal } from '@/components/beheer/BestellingModal';
import type { Bestelling } from '@/components/beheer/BestellingenSection';
import type { Kunstwerk, Materiaal, Maat } from '@/components/beheer/materiaalTypes';
import messages from '../../../messages/nl.json';

const updateDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
}));

const KUNSTWERKEN: Kunstwerk[] = [
  {
    id: 'kw-1',
    foto: 'https://example.com/kw-1.jpg',
    segmentIds: [],
    materiaalIds: ['mat-1'],
    maatIds: ['maat-1'],
    prijzen: [],
    omschrijvingNl: 'Hotel paneel',
    omschrijvingFr: '',
    omschrijvingDe: '',
    omschrijvingEn: '',
  },
];
const MATERIALEN: Materiaal[] = [
  { id: 'mat-1', materiaalsoortId: 'soort-1', materiaaldikte: 4, omschrijving: 'Veiligheidsglas' },
];
const MATEN: Maat[] = [{ id: 'maat-1', breedte: 40, hoogte: 60 }];

const BESTELLING: Bestelling = {
  id: 'header-1',
  klantId: 'uid-1',
  companyName: 'Testbedrijf BV',
  besteldatum: '1-7-2026',
  status: 'Te beoordelen',
  lineCount: 2,
  totalQuantity: 5,
  lines: [
    { id: 'line-1', kunstwerkId: 'kw-1', maatId: 'maat-1', materiaalId: 'mat-1', prijs: 150, quantity: 3 },
    { id: 'line-2', kunstwerkId: null, maatId: null, materiaalId: null, prijs: 0, quantity: 2 },
  ],
};

function renderModal(bestelling: Bestelling | null) {
  const onClose = vi.fn();
  const onUpdated = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <BestellingModal
        bestelling={bestelling}
        kunstwerken={KUNSTWERKEN}
        materialen={MATERIALEN}
        maten={MATEN}
        onClose={onClose}
        onUpdated={onUpdated}
      />
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

  it('shows the resolved kunstwerk photo, description, materiaal/maat labels and price for a known line', () => {
    renderModal(BESTELLING);
    const line1 = screen.getByTestId('bestelling-modal-line-line-1');
    expect(line1).toHaveTextContent('Hotel paneel');
    expect(line1).toHaveTextContent('4mm — Veiligheidsglas');
    expect(line1).toHaveTextContent('40×60 cm');
    expect(line1).toHaveTextContent('€ 150,00');
    expect(line1).toHaveTextContent('×3');
    expect(line1.querySelector('img')).toHaveAttribute('src', 'https://example.com/kw-1.jpg');
  });

  it('falls back to the "onbekend" label for a line whose kunstwerkId does not match any known kunstwerk', () => {
    renderModal(BESTELLING);
    const line2 = screen.getByTestId('bestelling-modal-line-line-2');
    expect(line2).toHaveTextContent('Onbekend');
    expect(line2).toHaveTextContent('×2');
    expect(line2.querySelector('img')).not.toBeInTheDocument();
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
