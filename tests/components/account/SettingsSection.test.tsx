import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { MockProfileProvider } from '@/lib/useMockProfile';
import { MockAuthProvider } from '@/lib/useMockAuth';
import { SettingsSection } from '@/components/account/SettingsSection';
import messages from '../../../messages/nl.json';

const replaceMock = vi.fn();
const signInMock = vi.fn();
const deleteUserMock = vi.fn();
const deleteDocMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/account',
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => signInMock(...args),
  deleteUser: (...args: unknown[]) => deleteUserMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...args),
}));

function renderSection() {
  window.localStorage.setItem('glassart-mock-logged-in', 'true');
  window.localStorage.setItem('glassart-mock-email', 'klant@example.com');
  window.localStorage.setItem('glassart-mock-uid', 'uid-1');
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <MockProfileProvider>
          <SettingsSection />
        </MockProfileProvider>
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  replaceMock.mockClear();
  signInMock.mockReset();
  deleteUserMock.mockReset();
  deleteDocMock.mockReset();
});

describe('SettingsSection', () => {
  it('pre-fills fields from the seeded mock profile', () => {
    renderSection();
    expect(screen.getByTestId('settings-company-name')).toHaveValue('Hotel De Zilveren Zwaan');
    expect(screen.getByTestId('settings-email')).toHaveValue('anne@dezilverenzwaan.nl');
    expect(screen.getByTestId('settings-contact-preference')).toHaveValue('email');
    expect(screen.getByTestId('settings-language-preference')).toHaveValue('nl');
  });

  it('shows a password-mismatch error and does not save when passwords differ', () => {
    renderSection();
    fireEvent.change(screen.getByTestId('settings-password'), { target: { value: 'nieuw123' } });
    fireEvent.change(screen.getByTestId('settings-password-confirm'), {
      target: { value: 'anders123' },
    });
    fireEvent.click(screen.getByTestId('settings-submit'));
    expect(screen.getByTestId('settings-password-error')).toHaveTextContent(
      'Wachtwoorden komen niet overeen.'
    );
    expect(screen.queryByTestId('settings-saved')).not.toBeInTheDocument();
  });

  it('saves profile changes and shows a saved confirmation', () => {
    renderSection();
    fireEvent.change(screen.getByTestId('settings-email'), {
      target: { value: 'nieuw@example.com' },
    });
    fireEvent.click(screen.getByTestId('settings-submit'));
    expect(screen.getByTestId('settings-saved')).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem('glassart-mock-profile') ?? '{}');
    expect(stored.email).toBe('nieuw@example.com');
  });

  it('switches the site locale via router.replace when languagePreference changes', () => {
    renderSection();
    fireEvent.change(screen.getByTestId('settings-language-preference'), {
      target: { value: 'en' },
    });
    fireEvent.click(screen.getByTestId('settings-submit'));
    expect(replaceMock).toHaveBeenCalledWith('/account', { locale: 'en' });
  });

  it('does not call router.replace when languagePreference is left unchanged', () => {
    renderSection();
    fireEvent.click(screen.getByTestId('settings-submit'));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('shows an error and deletes nothing when the confirmation password is wrong', async () => {
    signInMock.mockRejectedValue(new Error('auth/wrong-password'));
    renderSection();
    fireEvent.change(screen.getByTestId('delete-account-password'), {
      target: { value: 'fout' },
    });
    fireEvent.click(screen.getByTestId('delete-account-submit'));
    expect(await screen.findByTestId('delete-account-error')).toBeInTheDocument();
    expect(deleteDocMock).not.toHaveBeenCalled();
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it('shows a distinct partial-error message and stays on the page when deleteDoc succeeds but deleteUser fails', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'uid-1' } });
    deleteDocMock.mockResolvedValue(undefined);
    deleteUserMock.mockRejectedValue(new Error('requires-recent-login'));
    renderSection();
    fireEvent.change(screen.getByTestId('delete-account-password'), {
      target: { value: 'geheim123' },
    });
    fireEvent.click(screen.getByTestId('delete-account-submit'));

    expect(await screen.findByTestId('delete-account-error')).toHaveTextContent(
      'Uw gegevens zijn verwijderd, maar er ging iets mis bij het volledig verwijderen van uw account. Neem contact met ons op.'
    );
    expect(replaceMock).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBe('true');
  });

  it('re-authenticates, deletes the klant document and Firebase account, logs out and redirects home', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'uid-1' } });
    deleteDocMock.mockResolvedValue(undefined);
    deleteUserMock.mockResolvedValue(undefined);
    renderSection();
    fireEvent.change(screen.getByTestId('delete-account-password'), {
      target: { value: 'geheim123' },
    });
    fireEvent.click(screen.getByTestId('delete-account-submit'));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/'));

    expect(signInMock).toHaveBeenCalledWith({}, 'klant@example.com', 'geheim123');
    expect(deleteDocMock).toHaveBeenCalledWith({ collection: 'klanten', id: 'uid-1' });
    expect(deleteUserMock).toHaveBeenCalledWith({ uid: 'uid-1' });
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBeNull();
  });
});
