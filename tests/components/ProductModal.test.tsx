import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ProductModal } from '@/components/ProductModal';
import { CartProvider, useCart } from '@/lib/useCart';
import messages from '../../messages/nl.json';

const SAMPLE_IMAGE = {
  id: 'wellness-0',
  src: 'https://images.unsplash.com/example.jpg',
  segmentSlug: 'wellness',
  segmentMessageKey: 'wellness',
};

function renderModal(onClose: () => void = () => {}) {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CartProvider>
        <ProductModal image={SAMPLE_IMAGE} onClose={onClose} />
      </CartProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ProductModal', () => {
  it('renders nothing when image is null', () => {
    render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <CartProvider>
          <ProductModal image={null} onClose={() => {}} />
        </CartProvider>
      </NextIntlClientProvider>
    );
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
  });

  it('shows the segment title, default size, and quantity 1 when open', () => {
    renderModal();
    expect(screen.getByText('Wellness')).toBeInTheDocument();
    expect(screen.getByTestId('product-modal-size')).toHaveValue('40x60cm');
    expect(screen.getByTestId('product-modal-quantity-value')).toHaveTextContent('1');
  });

  it('increments and decrements quantity, never below 1', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('product-modal-quantity-minus'));
    expect(screen.getByTestId('product-modal-quantity-value')).toHaveTextContent('1');
    fireEvent.click(screen.getByTestId('product-modal-quantity-plus'));
    fireEvent.click(screen.getByTestId('product-modal-quantity-plus'));
    expect(screen.getByTestId('product-modal-quantity-value')).toHaveTextContent('3');
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    fireEvent.click(screen.getByTestId('product-modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    fireEvent.click(screen.getByTestId('product-modal-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('adds the chosen size/quantity to the cart, shows the confirmed state, then closes after the delay', () => {
    const onClose = vi.fn();

    function Probe() {
      const { items } = useCart();
      return <div data-testid="probe">{JSON.stringify(items)}</div>;
    }

    render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <CartProvider>
          <ProductModal image={SAMPLE_IMAGE} onClose={onClose} />
          <Probe />
        </CartProvider>
      </NextIntlClientProvider>
    );

    fireEvent.change(screen.getByTestId('product-modal-size'), { target: { value: '60x90cm' } });
    fireEvent.click(screen.getByTestId('product-modal-quantity-plus'));
    fireEvent.click(screen.getByTestId('product-modal-confirm'));

    const items = JSON.parse(screen.getByTestId('probe').textContent ?? '[]');
    expect(items).toHaveLength(1);
    expect(items[0].size).toBe('60x90cm');
    expect(items[0].quantity).toBe(2);

    expect(screen.getByTestId('product-modal-confirm')).toHaveTextContent('Toegevoegd!');
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('only adds one line to the cart when confirm is clicked twice within the feedback window', () => {
    const onClose = vi.fn();

    function Probe() {
      const { items } = useCart();
      return <div data-testid="probe">{JSON.stringify(items)}</div>;
    }

    render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <CartProvider>
          <ProductModal image={SAMPLE_IMAGE} onClose={onClose} />
          <Probe />
        </CartProvider>
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByTestId('product-modal-confirm'));
    // Second click happens before the 600ms close-timer elapses.
    fireEvent.click(screen.getByTestId('product-modal-confirm'));

    const items = JSON.parse(screen.getByTestId('probe').textContent ?? '[]');
    expect(items).toHaveLength(1);

    expect(screen.getByTestId('product-modal-confirm')).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    // Only one close-timer should have been scheduled, so onClose fires once.
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not let a stale close-timer from a previous image affect the newly shown modal', () => {
    const onClose = vi.fn();

    const { rerender } = render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <CartProvider>
          <ProductModal image={SAMPLE_IMAGE} onClose={onClose} />
        </CartProvider>
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByTestId('product-modal-confirm'));
    expect(screen.getByTestId('product-modal-confirm')).toHaveTextContent('Toegevoegd!');

    const NEXT_IMAGE = {
      id: 'wellness-1',
      src: 'https://images.unsplash.com/example-2.jpg',
      segmentSlug: 'wellness',
      segmentMessageKey: 'wellness',
    };

    // A new product is selected before the pending close-timer for the
    // previous product has fired (parent always passes through image=null
    // in between, per ProductModal's contract).
    rerender(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <CartProvider>
          <ProductModal image={null} onClose={onClose} />
        </CartProvider>
      </NextIntlClientProvider>
    );
    rerender(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <CartProvider>
          <ProductModal image={NEXT_IMAGE} onClose={onClose} />
        </CartProvider>
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId('product-modal-confirm')).toHaveTextContent('Toevoegen');

    // Advance past when the stale timer would have fired.
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // The stale timer must not have called onClose behind the newly shown modal.
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });
});
