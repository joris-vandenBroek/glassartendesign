import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AccountMenu } from '@/components/AccountMenu';
import { MockAuthProvider } from '@/lib/useMockAuth';
import messages from '../../messages/nl.json';

function renderAccountMenu() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <AccountMenu />
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('AccountMenu', () => {
  it('opens the order history panel with all 4 mock orders and a reorder button each', () => {
    renderAccountMenu();
    fireEvent.click(screen.getByTestId('account-icon'));

    expect(screen.getByTestId('order-history-panel')).toBeInTheDocument();
    expect(screen.getByTestId('order-GD-10234')).toBeInTheDocument();
    expect(screen.getByTestId('order-GD-10221')).toBeInTheDocument();
    expect(screen.getByTestId('order-GD-10198')).toBeInTheDocument();
    expect(screen.getByTestId('order-GD-10177')).toBeInTheDocument();
    expect(screen.getByTestId('reorder-GD-10234')).toBeInTheDocument();
    expect(screen.getByText('Abstract paneel 60x90cm')).toBeInTheDocument();
    expect(screen.getByText('In behandeling')).toBeInTheDocument();
  });

  it('calls logout (clearing localStorage) when "Uitloggen" is clicked', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderAccountMenu();
    fireEvent.click(screen.getByTestId('account-icon'));
    fireEvent.click(screen.getByTestId('nav-logout'));
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBeNull();
  });
});
