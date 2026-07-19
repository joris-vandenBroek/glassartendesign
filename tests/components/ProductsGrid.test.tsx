import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ProductsGrid } from '@/components/ProductsGrid';
import { CartProvider } from '@/lib/useCart';
import messages from '../../messages/nl.json';

function renderProductsGrid() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CartProvider>
        <ProductsGrid />
      </CartProvider>
    </NextIntlClientProvider>
  );
}

describe('ProductsGrid', () => {
  it('shows all 36 images and 7 filter buttons (all + 6 segments) by default', () => {
    renderProductsGrid();
    expect(screen.getAllByTestId('product-card')).toHaveLength(36);
    expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('filter-hotel')).toBeInTheDocument();
    expect(screen.getByTestId('filter-restaurant')).toBeInTheDocument();
    expect(screen.getByTestId('filter-wellness')).toBeInTheDocument();
    expect(screen.getByTestId('filter-office')).toBeInTheDocument();
    expect(screen.getByTestId('filter-abstract')).toBeInTheDocument();
    expect(screen.getByTestId('filter-artist-collections')).toBeInTheDocument();
  });

  it('shows only that segment\'s 6 images after clicking its filter button', () => {
    renderProductsGrid();
    fireEvent.click(screen.getByTestId('filter-wellness'));
    expect(screen.getAllByTestId('product-card')).toHaveLength(6);
  });

  it('returns to all 36 images after clicking the "Alle" filter again', () => {
    renderProductsGrid();
    fireEvent.click(screen.getByTestId('filter-wellness'));
    fireEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getAllByTestId('product-card')).toHaveLength(36);
  });

  it('marks the active filter button with aria-pressed', () => {
    renderProductsGrid();
    expect(screen.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('filter-office'));
    expect(screen.getByTestId('filter-office')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens the product modal when a card is clicked, closed by default', () => {
    renderProductsGrid();
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByTestId('product-card')[0]);
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });

  it('closes the product modal when its backdrop is clicked', () => {
    renderProductsGrid();
    fireEvent.click(screen.getAllByTestId('product-card')[0]);
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('product-modal-backdrop'));
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
  });
});
