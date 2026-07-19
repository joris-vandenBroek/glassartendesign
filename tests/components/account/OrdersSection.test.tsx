import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { OrdersProvider } from '@/lib/useOrders';
import { ReturnsProvider } from '@/lib/useReturns';
import { OrdersSection } from '@/components/account/OrdersSection';
import messages from '../../../messages/nl.json';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <OrdersProvider>
        <ReturnsProvider>
          <OrdersSection />
        </ReturnsProvider>
      </OrdersProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
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
