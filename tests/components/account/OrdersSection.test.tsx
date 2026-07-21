import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { OrdersProvider } from '@/lib/useOrders';
import { ReturnsProvider } from '@/lib/useReturns';
import { CustomerAuthProvider } from '@/lib/useCustomerAuth';
import { OrdersSection } from '@/components/account/OrdersSection';
import messages from '../../../messages/nl.json';

const onAuthStateChangedMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDoc: vi.fn(),
  collection: vi.fn((_db, ...segments: string[]) => ({ name: segments.join('/') })),
  query: vi.fn((collectionRef, ...constraints) => ({ collectionRef, constraints })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
}));

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerAuthProvider>
        <OrdersProvider>
          <ReturnsProvider>
            <OrdersSection />
          </ReturnsProvider>
        </OrdersProvider>
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  onAuthStateChangedMock.mockReset();
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback(null);
    return () => {};
  });
});

describe('OrdersSection', () => {
  it('renders all 4 seed orders with description and status', () => {
    renderSection();
    expect(screen.getByTestId('account-order-GD-10234')).toBeInTheDocument();
    expect(screen.getByTestId('account-order-GD-10221')).toBeInTheDocument();
    expect(screen.getByTestId('account-order-GD-10198')).toBeInTheDocument();
    expect(screen.getByTestId('account-order-GD-10177')).toBeInTheDocument();
    expect(screen.getByText('Abstract paneel 60x90cm')).toBeInTheDocument();
    expect(screen.getByText('In behandeling')).toBeInTheDocument();
  });
});
