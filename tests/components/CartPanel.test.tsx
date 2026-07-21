import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CartPanel } from '@/components/CartPanel';
import { CartProvider, useCart } from '@/lib/useCart';
import { CustomerAuthProvider } from '@/lib/useCustomerAuth';
import messages from '../../messages/nl.json';

const onAuthStateChangedMock = vi.fn();
const getDocMock = vi.fn();
const addDocMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  collection: vi.fn((_db, ...path) => ({ path })),
  addDoc: (...args: unknown[]) => addDocMock(...args),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}));

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

function renderCartPanel() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerAuthProvider>
        <CartProvider>
          <Seed />
          <CartPanel />
        </CartProvider>
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}

function signedOut() {
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback(null);
    return () => {};
  });
}

function signedInAsApprovedCustomer() {
  getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback({ uid: 'uid-1', email: 'klant@example.com' });
    return () => {};
  });
}

beforeEach(() => {
  window.localStorage.clear();
  onAuthStateChangedMock.mockReset();
  getDocMock.mockReset();
  addDocMock.mockReset();
  signedInAsApprovedCustomer();
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

  it('shows a login link instead of the place-order button when not logged in', async () => {
    signedOut();
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    fireEvent.click(screen.getByTestId('cart-icon'));
    await waitFor(() => expect(screen.getByTestId('cart-login-to-order')).toBeInTheDocument());
    expect(screen.getByTestId('cart-login-to-order')).toHaveAttribute('href', '/inloggen');
    expect(screen.queryByTestId('cart-place-order')).not.toBeInTheDocument();
  });

  it('writes a bestelheader + one bestelline per cart item, then clears the cart and closes the panel', async () => {
    addDocMock.mockResolvedValueOnce({ id: 'header-1' }).mockResolvedValue({ id: 'line-1' });
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    fireEvent.click(screen.getByTestId('cart-icon'));
    await waitFor(() => expect(screen.getByTestId('cart-place-order')).not.toBeDisabled());
    fireEvent.click(screen.getByTestId('cart-place-order'));

    await waitFor(() => expect(screen.queryByTestId('cart-panel')).not.toBeInTheDocument());
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();

    expect(addDocMock).toHaveBeenNthCalledWith(
      1,
      { path: ['bestelheaders'] },
      { klantId: 'uid-1', besteldatum: 'SERVER_TIMESTAMP', status: 'Te beoordelen' }
    );
    expect(addDocMock).toHaveBeenNthCalledWith(
      2,
      { path: ['bestelheaders', 'header-1', 'bestellines'] },
      { kunstwerkId: null, maatId: null, materiaalId: null, quantity: 2 }
    );
  });

  it('shows an error and keeps the cart intact when the Firestore write fails', async () => {
    addDocMock.mockRejectedValue(new Error('permission-denied'));
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    fireEvent.click(screen.getByTestId('cart-icon'));
    await waitFor(() => expect(screen.getByTestId('cart-place-order')).not.toBeDisabled());
    fireEvent.click(screen.getByTestId('cart-place-order'));

    expect(await screen.findByTestId('cart-place-order-error')).toHaveTextContent(
      'Er ging iets mis bij het plaatsen van de bestelling. Probeer het opnieuw.'
    );
    expect(screen.getByTestId('cart-panel')).toBeInTheDocument();
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('2');
  });

  it('disables the place-order button when the cart is empty', async () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('cart-icon'));
    await waitFor(() => expect(screen.getByTestId('cart-place-order')).toBeInTheDocument());
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

  it('empties the cart via "Bestelling leegmaken" without writing an order, and keeps the panel open', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('seed-cart'));
    fireEvent.click(screen.getByTestId('cart-icon'));
    fireEvent.click(screen.getByTestId('cart-clear'));

    expect(screen.getByTestId('cart-panel')).toBeInTheDocument();
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('disables "Bestelling leegmaken" when the cart is empty', () => {
    renderCartPanel();
    fireEvent.click(screen.getByTestId('cart-icon'));
    expect(screen.getByTestId('cart-clear')).toBeDisabled();
  });
});
