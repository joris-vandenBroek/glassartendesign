import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CustomerAuthProvider } from '@/lib/useCustomerAuth';
import { ReturnsProvider } from '@/lib/useReturns';
import { MockProfileProvider } from '@/lib/useMockProfile';
import { AccountDashboard } from '@/components/account/AccountDashboard';
import messages from '../../../messages/nl.json';

const replaceMock = vi.fn();
const onAuthStateChangedMock = vi.fn();
const getDocMock = vi.fn();
const logActiviteitMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/account',
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock('@/lib/logActiviteit', () => ({
  logActiviteit: (...args: unknown[]) => logActiviteitMock(...args),
  actorFromCustomer: (
    user: { uid: string; email: string | null; companyName: string | null; contactPerson: string | null } | null
  ) =>
    user
      ? { id: user.uid, email: user.email ?? 'Onbekend', naam: user.companyName ?? user.contactPerson ?? 'Onbekend' }
      : { id: null, email: 'Onbekend', naam: 'Onbekend' },
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  collection: vi.fn((_db, ...segments: string[]) => ({ name: segments.join('/') })),
  query: vi.fn((collectionRef, ...constraints) => ({ collectionRef, constraints })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
}));

function renderDashboard() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerAuthProvider>
        <ReturnsProvider>
          <MockProfileProvider>
            <AccountDashboard />
          </MockProfileProvider>
        </ReturnsProvider>
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  replaceMock.mockClear();
  onAuthStateChangedMock.mockReset();
  getDocMock.mockReset();
  logActiviteitMock.mockReset();
});

describe('AccountDashboard', () => {
  it('redirects to "/" and renders nothing when not logged in', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback(null);
      return () => {};
    });
    renderDashboard();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/'));
    expect(screen.queryByTestId('account-dashboard')).not.toBeInTheDocument();
  });

  it('renders the Bestellingen section by default when logged in', async () => {
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({ uid: 'uid-1', email: 'klant@example.com' });
      return () => {};
    });
    renderDashboard();
    await waitFor(() => expect(screen.getByTestId('orders-section')).toBeInTheDocument());
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('switches to the Instellingen section when its nav button is clicked', async () => {
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({ uid: 'uid-1', email: 'klant@example.com' });
      return () => {};
    });
    renderDashboard();
    await waitFor(() => expect(screen.getByTestId('orders-section')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('account-nav-settings'));
    expect(screen.getByTestId('settings-section')).toBeInTheDocument();
    expect(screen.queryByTestId('orders-section')).not.toBeInTheDocument();
  });

  it('logs account_bezocht exactly once with the logged-in klant', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ status: 'Goedgekeurd', companyName: 'Testbedrijf BV' }),
    });
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({ uid: 'uid-1', email: 'klant@example.com' });
      return () => {};
    });
    renderDashboard();
    await waitFor(() => expect(screen.getByTestId('orders-section')).toBeInTheDocument());
    expect(logActiviteitMock).toHaveBeenCalledTimes(1);
    expect(logActiviteitMock).toHaveBeenCalledWith('account_bezocht', {
      id: 'uid-1',
      email: 'klant@example.com',
      naam: 'Testbedrijf BV',
    });
  });

  it('does not log account_bezocht when redirected for not being logged in', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback(null);
      return () => {};
    });
    renderDashboard();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/'));
    expect(logActiviteitMock).not.toHaveBeenCalled();
  });
});
