import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { MockAuthProvider } from '@/lib/useMockAuth';
import { AccountNav } from '@/components/account/AccountNav';
import messages from '../../../messages/nl.json';

function renderNav(activeSection: 'orders' | 'settings' = 'orders') {
  const onSelect = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <AccountNav activeSection={activeSection} onSelect={onSelect} />
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
  return { onSelect };
}

describe('AccountNav', () => {
  it('renders all 6 section buttons plus a logout button', () => {
    renderNav();
    expect(screen.getByTestId('account-nav-orders')).toBeInTheDocument();
    expect(screen.getByTestId('account-nav-invoicesDue')).toBeInTheDocument();
    expect(screen.getByTestId('account-nav-invoicesPaid')).toBeInTheDocument();
    expect(screen.getByTestId('account-nav-returns')).toBeInTheDocument();
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
    fireEvent.click(screen.getByTestId('account-nav-returns'));
    expect(onSelect).toHaveBeenCalledWith('returns');
  });

  it('calls logout (clearing localStorage) when the logout button is clicked', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderNav();
    fireEvent.click(screen.getByTestId('account-nav-logout'));
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBeNull();
  });
});
