import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { NavBar } from '@/components/NavBar';
import { MockAuthProvider } from '@/lib/useMockAuth';
import messages from '../../messages/nl.json';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/components/AccountMenu', () => ({
  AccountMenu: () => <div data-testid="account-menu-stub" />,
}));

function renderNavBar() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <NavBar />
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('NavBar', () => {
  it('shows "Word klant" and "Inloggen" when logged out, no account menu', () => {
    renderNavBar();
    expect(screen.getByTestId('nav-become-client')).toBeInTheDocument();
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.queryByTestId('account-menu-stub')).not.toBeInTheDocument();
  });

  it('shows all 6 segment links in the collections dropdown on hover', () => {
    renderNavBar();
    fireEvent.mouseEnter(screen.getByTestId('collections-trigger'));
    expect(screen.getByTestId('nav-segment-hotel')).toBeInTheDocument();
    expect(screen.getByTestId('nav-segment-restaurant')).toBeInTheDocument();
    expect(screen.getByTestId('nav-segment-wellness')).toBeInTheDocument();
    expect(screen.getByTestId('nav-segment-office')).toBeInTheDocument();
    expect(screen.getByTestId('nav-segment-abstract')).toBeInTheDocument();
    expect(screen.getByTestId('nav-segment-artist-collections')).toBeInTheDocument();
  });

  it('shows the account menu instead of "Word klant"/"Inloggen" after clicking login', () => {
    renderNavBar();
    fireEvent.click(screen.getByTestId('nav-login'));
    expect(screen.getByTestId('account-menu-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-become-client')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-login')).not.toBeInTheDocument();
  });

  it('points Contact and Word klant at the homepage contact anchor', () => {
    renderNavBar();
    expect(screen.getByTestId('nav-contact')).toHaveAttribute('href', '/nl/#contact');
    expect(screen.getByTestId('nav-become-client')).toHaveAttribute('href', '/nl/#contact');
  });
});
