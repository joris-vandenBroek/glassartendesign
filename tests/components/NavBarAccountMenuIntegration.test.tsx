import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { NavBar } from '@/components/NavBar';
import { MockAuthProvider } from '@/lib/useMockAuth';
import { OrdersProvider } from '@/lib/useOrders';
import messages from '../../messages/nl.json';

// Unlike tests/components/NavBar.test.tsx, this file does NOT mock
// @/components/AccountMenu. The bug this test guards against is specifically
// about NavBar and AccountMenu sharing auth state, so both components must be
// the real implementations, mounted under a single shared MockAuthProvider —
// exactly as they are in the real app layout.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/components/CartPanel', () => ({
  CartPanel: () => <div data-testid="cart-panel-stub" />,
}));

function renderNavBarWithSharedAuth() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <OrdersProvider>
        <MockAuthProvider>
          <NavBar />
        </MockAuthProvider>
      </OrdersProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('NavBar + AccountMenu (shared MockAuthProvider)', () => {
  it('reflects logout from inside AccountMenu immediately, without a reload', () => {
    renderNavBarWithSharedAuth();

    // Log in via NavBar's own button.
    fireEvent.click(screen.getByTestId('nav-login'));

    // NavBar now renders the real AccountMenu.
    expect(screen.getByTestId('account-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-login')).not.toBeInTheDocument();

    // Open the order history panel and click logout inside it.
    fireEvent.click(screen.getByTestId('account-icon'));
    expect(screen.getByTestId('order-history-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('nav-logout'));

    // Regression check: before the fix, NavBar kept rendering AccountMenu
    // here because it held its own separate `isLoggedIn` copy that never
    // learned about AccountMenu's logout call. With a single shared
    // MockAuthProvider, NavBar must immediately show the login button again.
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.queryByTestId('account-icon')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBeNull();
  });
});
