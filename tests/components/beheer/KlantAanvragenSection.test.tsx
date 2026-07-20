import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { KlantAanvragenSection } from '@/components/beheer/KlantAanvragenSection';
import messages from '../../../messages/nl.json';

const getDocsMock = vi.fn();
const updateDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  query: vi.fn((ref, whereClause) => ({ ref, whereClause })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
}));

function makeSnapshot(docsData: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    docs: docsData.map(({ id, data }) => ({
      id,
      data: () => data,
    })),
  };
}

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <KlantAanvragenSection />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  getDocsMock.mockReset();
  updateDocMock.mockReset();
});

describe('KlantAanvragenSection', () => {
  it('shows an empty-state message when there are no pending aanvragen', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot([]));
    renderSection();
    expect(await screen.findByTestId('klantaanvragen-empty')).toBeInTheDocument();
  });

  it('shows each pending aanvraag with its data', async () => {
    getDocsMock.mockResolvedValue(
      makeSnapshot([
        {
          id: 'uid-1',
          data: {
            companyName: 'Testbedrijf BV',
            kvk: '12345678',
            contactPerson: 'Jan Jansen',
            email: 'jan@example.com',
            phone: '0612345678',
            contactPreference: 'email',
            address: 'Teststraat 1',
            postcode: '1234 AB',
            city: 'Teststad',
          },
        },
      ])
    );
    renderSection();
    expect(await screen.findByTestId('klantaanvraag-uid-1')).toHaveTextContent('Testbedrijf BV');
  });

  it('disables Goedkeuren until a prijsgroep is filled in, then approves and removes the row', async () => {
    getDocsMock.mockResolvedValue(
      makeSnapshot([
        {
          id: 'uid-1',
          data: {
            companyName: 'Testbedrijf BV',
            kvk: '12345678',
            contactPerson: 'Jan Jansen',
            email: 'jan@example.com',
            phone: '0612345678',
            contactPreference: 'email',
            address: 'Teststraat 1',
            postcode: '1234 AB',
            city: 'Teststad',
          },
        },
      ])
    );
    updateDocMock.mockResolvedValue(undefined);
    renderSection();
    await screen.findByTestId('klantaanvraag-uid-1');

    expect(screen.getByTestId('klantaanvraag-goedkeuren-uid-1')).toBeDisabled();

    fireEvent.change(screen.getByTestId('klantaanvraag-prijsgroep-uid-1'), {
      target: { value: 'Standaard' },
    });
    expect(screen.getByTestId('klantaanvraag-goedkeuren-uid-1')).not.toBeDisabled();

    fireEvent.click(screen.getByTestId('klantaanvraag-goedkeuren-uid-1'));

    await waitFor(() =>
      expect(updateDocMock).toHaveBeenCalledWith(
        { collectionName: 'klanten', id: 'uid-1' },
        { status: 'Goedgekeurd', prijsgroep: 'Standaard' }
      )
    );
    await waitFor(() => expect(screen.queryByTestId('klantaanvraag-uid-1')).not.toBeInTheDocument());
  });

  it('rejects and removes the row when Afwijzen is clicked', async () => {
    getDocsMock.mockResolvedValue(
      makeSnapshot([
        {
          id: 'uid-2',
          data: {
            companyName: 'Ander Bedrijf',
            kvk: '87654321',
            contactPerson: 'Piet Pietersen',
            email: 'piet@example.com',
            phone: '0698765432',
            contactPreference: 'phone',
            address: 'Anderstraat 2',
            postcode: '4321 BA',
            city: 'Anderstad',
          },
        },
      ])
    );
    updateDocMock.mockResolvedValue(undefined);
    renderSection();
    await screen.findByTestId('klantaanvraag-uid-2');

    fireEvent.click(screen.getByTestId('klantaanvraag-afwijzen-uid-2'));

    await waitFor(() =>
      expect(updateDocMock).toHaveBeenCalledWith(
        { collectionName: 'klanten', id: 'uid-2' },
        { status: 'Afgewezen' }
      )
    );
    await waitFor(() => expect(screen.queryByTestId('klantaanvraag-uid-2')).not.toBeInTheDocument());
  });

  it('shows load error when getDocs fails and does not show empty state', async () => {
    getDocsMock.mockRejectedValue(new Error('offline'));
    renderSection();

    expect(await screen.findByTestId('klantaanvragen-error')).toBeInTheDocument();
    expect(screen.getByTestId('klantaanvragen-error')).toHaveTextContent(
      'Kon de klantaanvragen niet laden. Probeer de pagina te verversen.'
    );
    expect(screen.queryByTestId('klantaanvragen-empty')).not.toBeInTheDocument();
  });

  it('shows action error when updateDoc fails and keeps the row in place', async () => {
    getDocsMock.mockResolvedValue(
      makeSnapshot([
        {
          id: 'uid-3',
          data: {
            companyName: 'Testbedrijf BV',
            kvk: '12345678',
            contactPerson: 'Jan Jansen',
            email: 'jan@example.com',
            phone: '0612345678',
            contactPreference: 'email',
            address: 'Teststraat 1',
            postcode: '1234 AB',
            city: 'Teststad',
          },
        },
      ])
    );
    updateDocMock.mockRejectedValue(new Error('permission-denied'));
    renderSection();
    await screen.findByTestId('klantaanvraag-uid-3');

    fireEvent.change(screen.getByTestId('klantaanvraag-prijsgroep-uid-3'), {
      target: { value: 'Standaard' },
    });

    fireEvent.click(screen.getByTestId('klantaanvraag-goedkeuren-uid-3'));

    expect(await screen.findByTestId('klantaanvragen-error')).toBeInTheDocument();
    expect(screen.getByTestId('klantaanvragen-error')).toHaveTextContent(
      'Er is iets misgegaan. Probeer het opnieuw.'
    );
    expect(screen.getByTestId('klantaanvraag-uid-3')).toBeInTheDocument();
  });
});
