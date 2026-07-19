import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { OrdersProvider } from '@/lib/useOrders';
import { ReturnsProvider } from '@/lib/useReturns';
import { ReturnsSection } from '@/components/account/ReturnsSection';
import messages from '../../../messages/nl.json';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <OrdersProvider>
        <ReturnsProvider>
          <ReturnsSection />
        </ReturnsProvider>
      </OrdersProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('ReturnsSection', () => {
  it('renders the order select, reason select (4 options), note field and submit button', () => {
    renderSection();
    expect(screen.getByTestId('returns-order-select')).toBeInTheDocument();
    const reasonSelect = screen.getByTestId('returns-reason-select') as HTMLSelectElement;
    expect(reasonSelect.options).toHaveLength(4);
    expect(screen.getByTestId('returns-note')).toBeInTheDocument();
    expect(screen.getByTestId('returns-submit')).toBeInTheDocument();
  });

  it('registers a return, shows a confirmation, and removes that order from the select', () => {
    renderSection();
    const orderSelect = screen.getByTestId('returns-order-select') as HTMLSelectElement;
    fireEvent.change(orderSelect, { target: { value: 'GD-10234' } });
    fireEvent.change(screen.getByTestId('returns-reason-select'), {
      target: { value: 'reasonDamaged' },
    });
    fireEvent.change(screen.getByTestId('returns-note'), {
      target: { value: 'Glas gebarsten' },
    });
    fireEvent.click(screen.getByTestId('returns-submit'));

    expect(screen.getByTestId('returns-confirmation')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /GD-10234/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('return-registered-GD-10234')).toBeInTheDocument();
  });

  it('shows the "no eligible orders" message once every seed order has a return registered', () => {
    renderSection();
    for (const id of ['GD-10234', 'GD-10221', 'GD-10198', 'GD-10177']) {
      fireEvent.change(screen.getByTestId('returns-order-select'), { target: { value: id } });
      fireEvent.click(screen.getByTestId('returns-submit'));
    }
    expect(screen.getByTestId('returns-no-eligible')).toBeInTheDocument();
    expect(screen.queryByTestId('returns-order-select')).not.toBeInTheDocument();
  });
});
