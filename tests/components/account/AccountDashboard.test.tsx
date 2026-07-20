import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { MockAuthProvider } from '@/lib/useMockAuth';
import { OrdersProvider } from '@/lib/useOrders';
import { ReturnsProvider } from '@/lib/useReturns';
import { MockProfileProvider } from '@/lib/useMockProfile';
import { AccountDashboard } from '@/components/account/AccountDashboard';
import messages from '../../../messages/nl.json';

const replaceMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/account',
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

function renderDashboard() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <OrdersProvider>
          <ReturnsProvider>
            <MockProfileProvider>
              <AccountDashboard />
            </MockProfileProvider>
          </ReturnsProvider>
        </OrdersProvider>
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replaceMock.mockClear();
});

describe('AccountDashboard', () => {
  it('redirects to "/" and renders nothing when not logged in', () => {
    renderDashboard();
    expect(replaceMock).toHaveBeenCalledWith('/');
    expect(screen.queryByTestId('account-dashboard')).not.toBeInTheDocument();
  });

  it('renders the Bestellingen section by default when logged in', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderDashboard();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('orders-section')).toBeInTheDocument();
  });

  it('switches to the Instellingen section when its nav button is clicked', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderDashboard();
    fireEvent.click(screen.getByTestId('account-nav-settings'));
    expect(screen.getByTestId('settings-section')).toBeInTheDocument();
    expect(screen.queryByTestId('orders-section')).not.toBeInTheDocument();
  });
});
