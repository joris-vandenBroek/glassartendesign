import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CustomerAuthProvider } from '@/lib/useCustomerAuth';
import { OrdersSection } from '@/components/account/OrdersSection';
import messages from '../../../messages/nl.json';

const onAuthStateChangedMock = vi.fn();
const getDocMock = vi.fn();
const getDocsMock = vi.fn();

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
        <OrdersSection />
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}

function signedInWithOneOrder() {
  getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback({ uid: 'uid-1', email: 'klant@example.com' });
    return () => {};
  });
  getDocsMock.mockImplementation((ref: { name?: string; collectionRef?: { name: string } }) => {
    const name = ref.name ?? ref.collectionRef?.name;
    if (name === 'bestelheaders') {
      return Promise.resolve({
        docs: [
          {
            id: 'header-1',
            data: () => ({
              klantId: 'uid-1',
              bestelnr: 'GD-00001',
              besteldatum: { toDate: () => new Date('2026-07-01T14:30:00') },
              status: 'Te beoordelen',
            }),
          },
        ],
      });
    }
    if (name === 'bestelheaders/header-1/bestellines') {
      return Promise.resolve({
        docs: [{ id: 'line-1', data: () => ({ quantity: 2 }) }],
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

describe('OrdersSection', () => {
  it('shows nothing when there are no orders', () => {
    renderSection();
    expect(screen.queryByTestId(/^account-order-/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('orders-load-error')).not.toBeInTheDocument();
  });

  it('shows an error message when loading orders fails', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({ uid: 'uid-1', email: 'klant@example.com' });
      return () => {};
    });
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
    getDocsMock.mockRejectedValue(new Error('permission-denied'));

    renderSection();

    expect(await screen.findByTestId('orders-load-error')).toHaveTextContent(
      'Bestellingen konden niet worden geladen. Probeer het later opnieuw.'
    );
  });

  it('renders a real order with bestelnr, description, date and time, and no status', async () => {
    signedInWithOneOrder();
    renderSection();

    await waitFor(() => expect(screen.getByTestId('account-order-GD-00001')).toBeInTheDocument());
    expect(screen.getByText('1 bestelregel, totaal 2 stuks')).toBeInTheDocument();
    expect(screen.getByText('1-7-2026 14:30')).toBeInTheDocument();
    expect(screen.queryByText('Te beoordelen')).not.toBeInTheDocument();
  });

  it('opens a modal with order details when a row is clicked', async () => {
    signedInWithOneOrder();
    renderSection();
    await waitFor(() => expect(screen.getByTestId('account-order-GD-00001')).toBeInTheDocument());
    expect(screen.queryByTestId('account-order-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('account-order-GD-00001'));

    expect(screen.getByTestId('account-order-modal')).toBeInTheDocument();
    expect(screen.getByTestId('account-order-modal-line-line-1')).toBeInTheDocument();
    expect(screen.getByText('Onbekend artikel')).toBeInTheDocument();
  });
});
