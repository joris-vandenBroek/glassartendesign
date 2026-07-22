import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ReturnsProvider } from '@/lib/useReturns';
import { CustomerAuthProvider } from '@/lib/useCustomerAuth';
import { ReturnsSection } from '@/components/account/ReturnsSection';
import messages from '../../../messages/nl.json';

const onAuthStateChangedMock = vi.fn();
const getDocMock = vi.fn();
const getDocsMock = vi.fn();

const ORDER_IDS = ['GD-00001', 'GD-00002', 'GD-00003', 'GD-00004'];

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  collection: vi.fn((_db, ...segments: string[]) => ({ name: segments.join('/') })),
  query: vi.fn((collectionRef, ...constraints) => ({ collectionRef, constraints })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
}));

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerAuthProvider>
        <ReturnsProvider>
          <ReturnsSection />
        </ReturnsProvider>
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}

function signedInWithFourOrders() {
  getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback({ uid: 'uid-1', email: 'klant@example.com' });
    return () => {};
  });
  getDocsMock.mockImplementation((ref: { name?: string; collectionRef?: { name: string } }) => {
    const name = ref.name ?? ref.collectionRef?.name;
    if (name === 'bestelheaders') {
      return Promise.resolve({
        docs: ORDER_IDS.map((bestelnr, index) => ({
          id: `header-${index}`,
          data: () => ({
            klantId: 'uid-1',
            bestelnr,
            besteldatum: { toDate: () => new Date('2026-07-01T14:30:00') },
            status: 'Te beoordelen',
          }),
        })),
      });
    }
    return Promise.resolve({ docs: [] });
  });
}

beforeEach(() => {
  window.localStorage.clear();
  onAuthStateChangedMock.mockReset();
  getDocMock.mockReset();
  getDocsMock.mockReset();
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback(null);
    return () => {};
  });
  getDocsMock.mockResolvedValue({ docs: [] });
});

describe('ReturnsSection', () => {
  it('shows the "no eligible orders" message when there are no orders', () => {
    renderSection();
    expect(screen.getByTestId('returns-no-eligible')).toBeInTheDocument();
    expect(screen.queryByTestId('returns-order-select')).not.toBeInTheDocument();
  });

  it('renders the order select, reason select (4 options), note field and submit button', async () => {
    signedInWithFourOrders();
    renderSection();
    await waitFor(() => expect(screen.getByTestId('returns-order-select')).toBeInTheDocument());
    const reasonSelect = screen.getByTestId('returns-reason-select') as HTMLSelectElement;
    expect(reasonSelect.options).toHaveLength(4);
    expect(screen.getByTestId('returns-note')).toBeInTheDocument();
    expect(screen.getByTestId('returns-submit')).toBeInTheDocument();
  });

  it('registers a return, shows a confirmation, and removes that order from the select', async () => {
    signedInWithFourOrders();
    renderSection();
    await waitFor(() => expect(screen.getByTestId('returns-order-select')).toBeInTheDocument());

    const orderSelect = screen.getByTestId('returns-order-select') as HTMLSelectElement;
    fireEvent.change(orderSelect, { target: { value: 'GD-00001' } });
    fireEvent.change(screen.getByTestId('returns-reason-select'), {
      target: { value: 'reasonDamaged' },
    });
    fireEvent.change(screen.getByTestId('returns-note'), {
      target: { value: 'Glas gebarsten' },
    });
    fireEvent.click(screen.getByTestId('returns-submit'));

    expect(screen.getByTestId('returns-confirmation')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /GD-00001/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('return-registered-GD-00001')).toBeInTheDocument();
  });

  it('shows the "no eligible orders" message once every order has a return registered', async () => {
    signedInWithFourOrders();
    renderSection();
    await waitFor(() => expect(screen.getByTestId('returns-order-select')).toBeInTheDocument());

    for (const id of ORDER_IDS) {
      fireEvent.change(screen.getByTestId('returns-order-select'), { target: { value: id } });
      fireEvent.click(screen.getByTestId('returns-submit'));
    }
    expect(screen.getByTestId('returns-no-eligible')).toBeInTheDocument();
    expect(screen.queryByTestId('returns-order-select')).not.toBeInTheDocument();
  });
});
