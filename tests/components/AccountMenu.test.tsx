import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AccountMenu } from '@/components/AccountMenu';
import { MockAuthProvider } from '@/lib/useMockAuth';
import { OrdersProvider, useOrders } from '@/lib/useOrders';
import messages from '../../messages/nl.json';

function Seed() {
  const { placeOrder } = useOrders();
  return (
    <button
      type="button"
      data-testid="seed-order"
      onClick={() => placeOrder('Wellness paneel 60x90cm ×2', 'Aangevraagd')}
    >
      Seed
    </button>
  );
}

function renderAccountMenu() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <OrdersProvider>
          <Seed />
          <AccountMenu />
        </OrdersProvider>
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('AccountMenu', () => {
  it('opens the order history panel with all 4 seed orders and a reorder button each', () => {
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

  it('shows a newly placed order before the 4 seed orders', () => {
    renderAccountMenu();
    fireEvent.click(screen.getByTestId('seed-order'));
    fireEvent.click(screen.getByTestId('account-icon'));

    const panel = screen.getByTestId('order-history-panel');
    const items = panel.querySelectorAll('li');
    expect(items).toHaveLength(5);
    expect(screen.getByText('Wellness paneel 60x90cm ×2')).toBeInTheDocument();
  });

  it('calls logout (clearing localStorage) when "Uitloggen" is clicked', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderAccountMenu();
    fireEvent.click(screen.getByTestId('account-icon'));
    fireEvent.click(screen.getByTestId('nav-logout'));
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBeNull();
  });
});
