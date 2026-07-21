import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CustomerLoginForm } from '@/components/CustomerLoginForm';
import messages from '../../messages/nl.json';

const signInMock = vi.fn();
const signOutMock = vi.fn();
const getDocMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => signInMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerLoginForm />
    </NextIntlClientProvider>
  );
}

function submitWith(email: string, password: string) {
  fireEvent.change(screen.getByTestId('login-email'), { target: { value: email } });
  fireEvent.change(screen.getByTestId('login-password'), { target: { value: password } });
  fireEvent.submit(screen.getByTestId('login-submit').closest('form')!);
}

beforeEach(() => {
  signInMock.mockReset();
  signOutMock.mockReset();
  getDocMock.mockReset();
  replaceMock.mockReset();
});

describe('CustomerLoginForm', () => {
  it('shows a generic error when the credentials are wrong', async () => {
    signInMock.mockRejectedValue(new Error('auth/wrong-password'));
    renderForm();
    submitWith('klant@example.com', 'fout');
    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      'E-mailadres of wachtwoord onjuist.'
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('grants access, keeps the session alive, and redirects to /account when the klant is "Goedgekeurd"', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'uid-1' } });
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
    renderForm();
    submitWith('klant@example.com', 'geheim123');

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/account'));
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it('shows a pending message, signs out, and does not grant access when status is "Beoordelen"', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'uid-2' } });
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Beoordelen' }) });
    signOutMock.mockResolvedValue(undefined);
    renderForm();
    submitWith('klant@example.com', 'geheim123');

    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      'Uw aanvraag wordt nog beoordeeld.'
    );
    expect(signOutMock).toHaveBeenCalledWith({});
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('shows a rejected message and signs out when status is "Afgewezen"', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'uid-3' } });
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Afgewezen' }) });
    signOutMock.mockResolvedValue(undefined);
    renderForm();
    submitWith('klant@example.com', 'geheim123');

    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      'Uw aanvraag is helaas afgewezen.'
    );
    expect(signOutMock).toHaveBeenCalledWith({});
  });

  it('shows the accountIncompleteMessage and signs out when the klant document does not exist', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'uid-5' } });
    getDocMock.mockResolvedValue({ exists: () => false });
    signOutMock.mockResolvedValue(undefined);
    renderForm();
    submitWith('klant@example.com', 'geheim123');

    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      'Er ging iets mis bij uw eerdere aanvraag. Neem contact met ons op.'
    );
    expect(signOutMock).toHaveBeenCalledWith({});
  });

  it('signs out and shows generic error when getDoc fails after successful sign-in', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'uid-4' } });
    getDocMock.mockRejectedValue(new Error('permission-denied'));
    signOutMock.mockResolvedValue(undefined);
    renderForm();
    submitWith('klant@example.com', 'geheim123');

    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      'E-mailadres of wachtwoord onjuist.'
    );
    expect(signOutMock).toHaveBeenCalledWith({});
  });
});
