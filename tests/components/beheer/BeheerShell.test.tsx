import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BeheerShell } from '@/components/beheer/BeheerShell';
import messages from '../../../messages/nl.json';

const getDocsMock = vi.fn();
const addDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  addDoc: (...args: unknown[]) => addDocMock(...args),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

function makeSnapshot(docsData: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    empty: docsData.length === 0,
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

// Non-empty by default so the auto-seed path never triggers in these
// wiring tests — seeding itself is covered by the collection-specific
// data tests and useFirestoreCollection.test.tsx.
const DEFAULT_COLLECTIONS: Record<string, Array<{ id: string; data: Record<string, unknown> }>> = {
  klanten: [],
  materiaalsoorten: [{ id: 'soort-1', data: { omschrijving: 'Veiligheidsglas' } }],
  materialen: [{ id: 'mat-1', data: { materiaalsoortId: 'soort-1', materiaaldikte: 4, omschrijving: 'Test' } }],
  maten: [{ id: 'maat-1', data: { breedte: 40, hoogte: 60 } }],
  segmenten: [{ id: 'seg-1', data: { omschrijving: 'Hotel' } }],
  kunstwerken: [
    {
      id: 'kw-1',
      data: {
        foto: 'https://storage.example.com/kw-1.jpg',
        segmentIds: ['seg-1'],
        materiaalIds: ['mat-1'],
        maatIds: ['maat-1'],
        prijzen: [{ materiaalId: 'mat-1', maatId: 'maat-1', prijs: 150 }],
        omschrijvingNl: 'Hotel paneel 1',
        omschrijvingFr: '',
        omschrijvingDe: '',
        omschrijvingEn: '',
      },
    },
  ],
};

function mockCollections(overrides: Partial<typeof DEFAULT_COLLECTIONS> = {}) {
  const data = { ...DEFAULT_COLLECTIONS, ...overrides };
  getDocsMock.mockImplementation((collectionRef: { name: string }) =>
    Promise.resolve(makeSnapshot(data[collectionRef.name] ?? []))
  );
}

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
  addDocMock.mockReset();
});

describe('BeheerShell', () => {
  it('shows the logged-in email and defaults to the Klanten section', async () => {
    mockCollections({ klanten: [{ id: 'uid-1', data: KLANT_DATA }] });
    renderShell();
    expect(screen.getByTestId('beheer-logged-in-as')).toHaveTextContent('paul@glassartanddesign.com');
    expect(await screen.findByTestId('klanten-section')).toBeInTheDocument();
  });

  it('calls onLogout when the nav logout button is clicked', async () => {
    mockCollections();
    const { onLogout } = renderShell();
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());
    screen.getByTestId('beheer-nav-logout').click();
    expect(onLogout).toHaveBeenCalled();
  });

  it('shows the segmenten count and switches to the Segmenten section', async () => {
    mockCollections({
      segmenten: [
        { id: 'seg-1', data: { omschrijving: 'Hotel' } },
        { id: 'seg-2', data: { omschrijving: 'Restaurant' } },
      ],
    });
    renderShell();
    await waitFor(() => expect(screen.getByTestId('beheer-nav-segmenten')).toHaveTextContent('2'));
    screen.getByTestId('beheer-nav-segmenten').click();
    expect(await screen.findByTestId('segmenten-section')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-row-seg-1')).toHaveTextContent('Hotel');
  });

  it('shows the kunstwerken count and switches to the Kunstwerken section with segment names resolved', async () => {
    mockCollections();
    renderShell();
    await waitFor(() => expect(screen.getByTestId('beheer-nav-kunstwerken')).toHaveTextContent('1'));
    screen.getByTestId('beheer-nav-kunstwerken').click();
    expect(await screen.findByTestId('kunstwerken-section')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-row-kw-1')).toHaveTextContent('Hotel');
  });

  it('shows a load error on the Kunstwerken section when getDocs fails for kunstwerken', async () => {
    getDocsMock.mockImplementation((collectionRef: { name: string }) => {
      if (collectionRef.name === 'kunstwerken') {
        return Promise.reject(new Error('offline'));
      }
      return Promise.resolve(makeSnapshot(DEFAULT_COLLECTIONS[collectionRef.name] ?? []));
    });
    renderShell();
    screen.getByTestId('beheer-nav-kunstwerken').click();
    expect(await screen.findByTestId('kunstwerken-error')).toHaveTextContent(
      'Kon de kunstwerken niet laden. Probeer de pagina te verversen.'
    );
  });
});
