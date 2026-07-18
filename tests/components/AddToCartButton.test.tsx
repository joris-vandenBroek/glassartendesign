import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CartProvider, useCart } from '@/lib/useCart';
import messages from '../../messages/nl.json';

function renderButton() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CartProvider>
        <AddToCartButton
          segmentSlug="wellness"
          segmentMessageKey="wellness"
          imageSrc="https://images.unsplash.com/example.jpg"
        />
      </CartProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('AddToCartButton', () => {
  it('shows the collapsed add-to-cart button by default, no panel', () => {
    renderButton();
    expect(screen.getByTestId('add-to-cart-button')).toBeInTheDocument();
    expect(screen.queryByTestId('add-to-cart-panel')).not.toBeInTheDocument();
  });

  it('opens the size/quantity panel when clicked', () => {
    renderButton();
    fireEvent.click(screen.getByTestId('add-to-cart-button'));
    expect(screen.getByTestId('add-to-cart-panel')).toBeInTheDocument();
    expect(screen.getByTestId('add-to-cart-size')).toHaveValue('40x60cm');
    expect(screen.getByTestId('add-to-cart-quantity-value')).toHaveTextContent('1');
  });

  it('increments and decrements quantity, never below 1', () => {
    renderButton();
    fireEvent.click(screen.getByTestId('add-to-cart-button'));
    fireEvent.click(screen.getByTestId('add-to-cart-quantity-minus'));
    expect(screen.getByTestId('add-to-cart-quantity-value')).toHaveTextContent('1');
    fireEvent.click(screen.getByTestId('add-to-cart-quantity-plus'));
    fireEvent.click(screen.getByTestId('add-to-cart-quantity-plus'));
    expect(screen.getByTestId('add-to-cart-quantity-value')).toHaveTextContent('3');
  });

  it('adds the chosen size/quantity to the cart and closes the panel on confirm', () => {
    function Probe() {
      const { items } = useCart();
      return <div data-testid="probe">{JSON.stringify(items)}</div>;
    }

    render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <CartProvider>
          <AddToCartButton
            segmentSlug="wellness"
            segmentMessageKey="wellness"
            imageSrc="https://images.unsplash.com/example.jpg"
          />
          <Probe />
        </CartProvider>
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByTestId('add-to-cart-button'));
    fireEvent.change(screen.getByTestId('add-to-cart-size'), { target: { value: '60x90cm' } });
    fireEvent.click(screen.getByTestId('add-to-cart-quantity-plus'));
    fireEvent.click(screen.getByTestId('add-to-cart-confirm'));

    expect(screen.queryByTestId('add-to-cart-panel')).not.toBeInTheDocument();
    const items = JSON.parse(screen.getByTestId('probe').textContent ?? '[]');
    expect(items).toHaveLength(1);
    expect(items[0].size).toBe('60x90cm');
    expect(items[0].quantity).toBe(2);
  });
});
