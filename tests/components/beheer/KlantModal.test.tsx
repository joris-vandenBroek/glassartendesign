import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { KlantModal } from '@/components/beheer/KlantModal';
import type { Klant } from '@/components/beheer/KlantenSection';
import messages from '../../../messages/nl.json';

const updateDocMock = vi.fn();
const logActiviteitMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
}));

vi.mock('@/lib/useAdminAuth', () => ({
  useAdminAuth: () => ({ user: { uid: 'staff-1', email: 'paul@glassartanddesign.com' } }),
}));

vi.mock('@/lib/logActiviteit', () => ({
  logActiviteit: (...args: unknown[]) => logActiviteitMock(...args),
  actorFromMedewerker: (user: { uid: string; email: string | null } | null) =>
    user
      ? { id: user.uid, email: user.email ?? 'Onbekend', naam: user.email ?? 'Onbekend' }
      : { id: null, email: 'Onbekend', naam: 'Onbekend' },
}));

const KLANT: Klant = {
  id: 'uid-1',
  companyName: 'Testbedrijf BV',
  kvk: '12345678',
  contactPerson: 'Jan Jansen',
  email: 'jan@example.com',
  phone: '0612345678',
  contactPreference: 'email',
  address: 'Teststraat 1',
  postcode: '1234 AB',
  city: 'Teststad',
  status: 'Beoordelen',
  prijsgroep: '',
};

function renderModal(klant: Klant | null) {
  const onClose = vi.fn();
  const onUpdated = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <KlantModal klant={klant} onClose={onClose} onUpdated={onUpdated} />
    </NextIntlClientProvider>
  );
  return { onClose, onUpdated };
}

beforeEach(() => {
  updateDocMock.mockReset();
  logActiviteitMock.mockReset();
});

describe('KlantModal', () => {
  it('renders nothing when klant is null', () => {
    renderModal(null);
    expect(screen.queryByTestId('klant-modal')).not.toBeInTheDocument();
  });

  it('shows the klant details and pre-fills the prijsgroep field', () => {
    renderModal({ ...KLANT, prijsgroep: 'Standaard' });
    expect(screen.getByTestId('klant-modal')).toHaveTextContent('Testbedrijf BV');
    expect(screen.getByTestId('klant-modal')).toHaveTextContent('12345678');
    expect(screen.getByTestId('klant-modal-prijsgroep')).toHaveValue('Standaard');
  });

  it('disables Goedkeuren until a prijsgroep is filled in', () => {
    renderModal(KLANT);
    expect(screen.getByTestId('klant-modal-goedkeuren')).toBeDisabled();
    fireEvent.change(screen.getByTestId('klant-modal-prijsgroep'), { target: { value: 'Standaard' } });
    expect(screen.getByTestId('klant-modal-goedkeuren')).not.toBeDisabled();
  });

  it('approves the klant and calls onUpdated with the updated klant', async () => {
    updateDocMock.mockResolvedValue(undefined);
    const { onUpdated } = renderModal(KLANT);
    fireEvent.change(screen.getByTestId('klant-modal-prijsgroep'), { target: { value: 'Premium' } });
    fireEvent.click(screen.getByTestId('klant-modal-goedkeuren'));

    await waitFor(() =>
      expect(updateDocMock).toHaveBeenCalledWith(
        { collectionName: 'klanten', id: 'uid-1' },
        { status: 'Goedgekeurd', prijsgroep: 'Premium' }
      )
    );
    await waitFor(() =>
      expect(onUpdated).toHaveBeenCalledWith({ ...KLANT, status: 'Goedgekeurd', prijsgroep: 'Premium' })
    );
  });

  it('rejects the klant and calls onUpdated with the updated klant', async () => {
    updateDocMock.mockResolvedValue(undefined);
    const { onUpdated } = renderModal(KLANT);
    fireEvent.click(screen.getByTestId('klant-modal-afwijzen'));

    await waitFor(() =>
      expect(updateDocMock).toHaveBeenCalledWith(
        { collectionName: 'klanten', id: 'uid-1' },
        { status: 'Afgewezen' }
      )
    );
    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith({ ...KLANT, status: 'Afgewezen' }));
  });

  it('shows an error and does not call onUpdated when updateDoc fails', async () => {
    updateDocMock.mockRejectedValue(new Error('offline'));
    const { onUpdated } = renderModal(KLANT);
    fireEvent.click(screen.getByTestId('klant-modal-afwijzen'));

    expect(await screen.findByTestId('klant-modal-error')).toBeInTheDocument();
    expect(onUpdated).not.toHaveBeenCalled();
  });

  it('logs klant_goedgekeurd with the logged-in medewerker on approval', async () => {
    updateDocMock.mockResolvedValue(undefined);
    renderModal(KLANT);
    fireEvent.change(screen.getByTestId('klant-modal-prijsgroep'), { target: { value: 'Premium' } });
    fireEvent.click(screen.getByTestId('klant-modal-goedkeuren'));
    await waitFor(() =>
      expect(logActiviteitMock).toHaveBeenCalledWith('klant_goedgekeurd', {
        id: 'staff-1',
        email: 'paul@glassartanddesign.com',
        naam: 'paul@glassartanddesign.com',
      })
    );
  });

  it('logs klant_afgewezen with the logged-in medewerker on rejection', async () => {
    updateDocMock.mockResolvedValue(undefined);
    renderModal(KLANT);
    fireEvent.click(screen.getByTestId('klant-modal-afwijzen'));
    await waitFor(() =>
      expect(logActiviteitMock).toHaveBeenCalledWith('klant_afgewezen', {
        id: 'staff-1',
        email: 'paul@glassartanddesign.com',
        naam: 'paul@glassartanddesign.com',
      })
    );
  });

  it('does not log when updateDoc fails', async () => {
    updateDocMock.mockRejectedValue(new Error('offline'));
    renderModal(KLANT);
    fireEvent.click(screen.getByTestId('klant-modal-afwijzen'));
    await screen.findByTestId('klant-modal-error');
    expect(logActiviteitMock).not.toHaveBeenCalled();
  });
});
