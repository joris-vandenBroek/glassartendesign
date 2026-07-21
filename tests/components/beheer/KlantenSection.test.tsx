import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { KlantenSection, type Klant } from '@/components/beheer/KlantenSection';
import messages from '../../../messages/nl.json';

const updateDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
}));

const KLANTEN: Klant[] = [
  {
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
  },
  {
    id: 'uid-2',
    companyName: 'Ander Bedrijf',
    kvk: '87654321',
    contactPerson: 'Piet Pietersen',
    email: 'piet@example.com',
    phone: '0698765432',
    contactPreference: 'phone',
    address: 'Anderstraat 2',
    postcode: '4321 BA',
    city: 'Anderstad',
    status: 'Goedgekeurd',
    prijsgroep: 'Standaard',
  },
];

function renderSection(overrides: Partial<React.ComponentProps<typeof KlantenSection>> = {}) {
  const onKlantUpdated = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <KlantenSection klanten={KLANTEN} loadError={null} onKlantUpdated={onKlantUpdated} {...overrides} />
    </NextIntlClientProvider>
  );
  return { onKlantUpdated };
}

beforeEach(() => {
  updateDocMock.mockReset();
});

describe('KlantenSection', () => {
  it('shows the load error instead of the table when loadError is set', () => {
    renderSection({ loadError: 'Kon niet laden.' });
    expect(screen.getByTestId('klanten-error')).toHaveTextContent('Kon niet laden.');
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
  });

  it('renders nothing while klanten is null and there is no error', () => {
    renderSection({ klanten: null });
    expect(screen.queryByTestId('klanten-section')).not.toBeInTheDocument();
  });

  it('shows only the "Beoordelen" klant by default (status filter defaults to Beoordelen)', () => {
    renderSection();
    expect(screen.getByTestId('data-table-row-uid-1')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-uid-2')).not.toBeInTheDocument();
  });

  it('shows all klanten after clicking the "alle klanten" quick filter link', () => {
    renderSection();
    fireEvent.click(screen.getByTestId('data-table-quick-all'));
    expect(screen.getByTestId('data-table-row-uid-1')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-row-uid-2')).toBeInTheDocument();
  });

  it('opens the KlantModal with the clicked klant\'s data when a row is clicked', () => {
    renderSection();
    fireEvent.click(screen.getByTestId('data-table-row-uid-1'));
    expect(screen.getByTestId('klant-modal')).toHaveTextContent('Testbedrijf BV');
  });

  it('closes the modal and reports the updated klant via onKlantUpdated after approving', async () => {
    updateDocMock.mockResolvedValue(undefined);
    const { onKlantUpdated } = renderSection();
    fireEvent.click(screen.getByTestId('data-table-row-uid-1'));
    fireEvent.change(screen.getByTestId('klant-modal-prijsgroep'), { target: { value: 'Premium' } });
    fireEvent.click(screen.getByTestId('klant-modal-goedkeuren'));

    await waitFor(() =>
      expect(onKlantUpdated).toHaveBeenCalledWith({ ...KLANTEN[0], status: 'Goedgekeurd', prijsgroep: 'Premium' })
    );
    await waitFor(() => expect(screen.queryByTestId('klant-modal')).not.toBeInTheDocument());
  });
});
