import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CustomerAuthProvider } from '@/lib/useCustomerAuth';
import { AccountNav } from '@/components/account/AccountNav';
import messages from '../../../messages/nl.json';

const onAuthStateChangedMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  getDoc: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) }),
}));

function renderNav(activeSection: 'orders' | 'settings' = 'orders') {
  const onSelect = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerAuthProvider>
        <AccountNav activeSection={activeSection} onSelect={onSelect} />
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
  return { onSelect };
}

beforeEach(() => {
  onAuthStateChangedMock.mockReset();
  signOutMock.mockReset();
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback({ uid: 'uid-1', email: 'klant@example.com' });
    return () => {};
  });
});

describe('AccountNav', () => {
  it('renders all 3 section buttons plus a logout button', () => {
    renderNav();
    expect(screen.getByTestId('account-nav-orders')).toBeInTheDocument();
    expect(screen.getByTestId('account-nav-conversations')).toBeInTheDocument();
    expect(screen.getByTestId('account-nav-settings')).toBeInTheDocument();
    expect(screen.getByTestId('account-nav-logout')).toBeInTheDocument();
  });

  it('marks the active section with aria-current', () => {
    renderNav('settings');
    expect(screen.getByTestId('account-nav-settings')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByTestId('account-nav-orders')).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the clicked section id', () => {
    const { onSelect } = renderNav();
    fireEvent.click(screen.getByTestId('account-nav-settings'));
    expect(onSelect).toHaveBeenCalledWith('settings');
  });

  it('calls signOut when the logout button is clicked', () => {
    renderNav();
    fireEvent.click(screen.getByTestId('account-nav-logout'));
    expect(signOutMock).toHaveBeenCalledWith({});
  });
});
