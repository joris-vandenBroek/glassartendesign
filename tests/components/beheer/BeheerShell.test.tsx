import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BeheerShell } from '@/components/beheer/BeheerShell';
import messages from '../../../messages/nl.json';

const getDocsMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  updateDoc: vi.fn(),
}));

function makeSnapshot(docsData: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    docs: docsData.map(({ id, data }) => ({ id, data: () => data })),
  };
}

const KLANT_DATA = {
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

function renderShell() {
  const onLogout = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <BeheerShell email="paul@glassartanddesign.com" onLogout={onLogout} />
    </NextIntlClientProvider>
  );
  return { onLogout };
}

beforeEach(() => {
  getDocsMock.mockReset();
});

describe('BeheerShell', () => {
  it('shows the logged-in email and defaults to the Klanten section', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot([{ id: 'uid-1', data: KLANT_DATA }]));
    renderShell();
    expect(screen.getByTestId('beheer-logged-in-as')).toHaveTextContent('paul@glassartanddesign.com');
    expect(await screen.findByTestId('klanten-section')).toBeInTheDocument();
  });

  it('shows the count of "Beoordelen" klanten on the Klanten nav item', async () => {
    getDocsMock.mockResolvedValue(
      makeSnapshot([
        { id: 'uid-1', data: KLANT_DATA },
        { id: 'uid-2', data: { ...KLANT_DATA, status: 'Goedgekeurd' } },
      ])
    );
    renderShell();
    await waitFor(() => expect(screen.getByTestId('beheer-nav-klanten')).toHaveTextContent('1'));
  });

  it('switches to the Facturen section when its nav item is clicked', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot([]));
    renderShell();
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());
    screen.getByTestId('beheer-nav-facturen').click();
    expect(await screen.findByTestId('facturen-section')).toBeInTheDocument();
    expect(screen.queryByTestId('klanten-section')).not.toBeInTheDocument();
  });

  it('calls onLogout when the nav logout button is clicked', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot([]));
    const { onLogout } = renderShell();
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());
    screen.getByTestId('beheer-nav-logout').click();
    expect(onLogout).toHaveBeenCalled();
  });

  it('shows a load error on the Klanten section when getDocs fails', async () => {
    getDocsMock.mockRejectedValue(new Error('offline'));
    renderShell();
    expect(await screen.findByTestId('klanten-error')).toHaveTextContent(
      'Kon de klanten niet laden. Probeer de pagina te verversen.'
    );
  });
});
