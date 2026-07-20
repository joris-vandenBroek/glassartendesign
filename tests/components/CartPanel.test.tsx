import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CartPanel } from '@/components/CartPanel';
import { CartProvider, useCart } from '@/lib/useCart';
import { OrdersProvider, useOrders } from '@/lib/useOrders';
import messages from '../../messages/nl.json';

function Seed() {
  const { addItem } = useCart();
  return (
    <button
      type="button"
      data-testid="seed-cart"
      onClick={() =>
        addItem({
          segmentSlug: 'wellness',
          segmentMessageKey: 'wellness',
          imageSrc: 'https://images.unsplash.com/example.jpg',
          size: '60x90cm',
          quantity: 2,
        })
      }
    >
      Seed
    </button>
  );
}

function OrdersProbe() {
  const { placedOrders } = useOrders();
  return <div data-testid="orders-probe">{JSON.stringify(placedOrders)}</div>;
}

function renderCartPanel() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CartProvider>
        <OrdersProvider>
          <Seed />
          <CartPanel />
          <OrdersProbe />
        </OrdersProvider>
      </CartProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('CartPanel', () => {
  it('shows no badge when the cart is empty, and an empty message when opened', () => {
    renderCartPanel();
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cart-icon'));
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
  });

  it('shows a badge with the total quantity and lists cart items once seeded', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('2');
    fireEvent.click(screen.getByTestId('cart-icon'));
    expect(screen.queryByTestId('cart-empty')).not.toBeInTheDocument();
    expect(screen.getByText('Wellness')).toBeInTheDocument();
    expect(screen.getByText('60x90cm · ×2')).toBeInTheDocument();
  });

  it('removes an item when its remove button is clicked', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    fireEvent.click(screen.getByTestId('cart-icon'));
    const removeButtons = screen.getAllByLabelText('Verwijderen');
    fireEvent.click(removeButtons[0]);
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
  });

  it('places an order from the cart contents, then clears the cart and closes the panel', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    fireEvent.click(screen.getByTestId('cart-icon'));
    fireEvent.click(screen.getByTestId('cart-place-order'));

    expect(screen.queryByTestId('cart-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();

    const placedOrders = JSON.parse(screen.getByTestId('orders-probe').textContent ?? '[]');
    expect(placedOrders).toHaveLength(1);
    expect(placedOrders[0].description).toBe('Wellness 60x90cm ×2');
    expect(placedOrders[0].status).toBe('Aangevraagd');
  });

  it('disables the place-order button when the cart is empty', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('cart-icon'));
    expect(screen.getByTestId('cart-place-order')).toBeDisabled();
  });

  it('closes the panel when Escape is pressed', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('cart-icon'));
    expect(screen.getByTestId('cart-panel')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('cart-panel')).not.toBeInTheDocument();
  });

  it('closes the panel when the backdrop is clicked', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('cart-icon'));
    fireEvent.click(screen.getByTestId('cart-backdrop'));
    expect(screen.queryByTestId('cart-panel')).not.toBeInTheDocument();
  });

  it('empties the cart via "Bestelling leegmaken" without placing an order, and keeps the panel open', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    fireEvent.click(screen.getByTestId('cart-icon'));
    fireEvent.click(screen.getByTestId('cart-clear'));

    expect(screen.getByTestId('cart-panel')).toBeInTheDocument();
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();

    const placedOrders = JSON.parse(screen.getByTestId('orders-probe').textContent ?? '[]');
    expect(placedOrders).toHaveLength(0);
  });

  it('disables "Bestelling leegmaken" when the cart is empty', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('cart-icon'));
    expect(screen.getByTestId('cart-clear')).toBeDisabled();
  });
});
