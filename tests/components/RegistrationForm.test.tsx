import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { RegistrationForm } from '@/components/RegistrationForm';
import messages from '../../messages/nl.json';

const createUserMock = vi.fn();
const signOutMock = vi.fn();
const setDocMock = vi.fn();
const deleteUserMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) => createUserMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
  deleteUser: (...args: unknown[]) => deleteUserMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  setDoc: (...args: unknown[]) => setDocMock(...args),
  serverTimestamp: () => 'MOCK_TIMESTAMP',
}));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <RegistrationForm />
    </NextIntlClientProvider>
  );
}

function fillRequiredFields() {
  fireEvent.change(screen.getByTestId('word-klant-company-name'), {
    target: { value: 'Testbedrijf BV' },
  });
  fireEvent.change(screen.getByTestId('word-klant-kvk'), { target: { value: '12345678' } });
  fireEvent.change(screen.getByTestId('word-klant-contact-person'), {
    target: { value: 'Jan Jansen' },
  });
  fireEvent.change(screen.getByTestId('word-klant-email'), {
    target: { value: 'jan@example.com' },
  });
  fireEvent.change(screen.getByTestId('word-klant-phone'), { target: { value: '0612345678' } });
  fireEvent.change(screen.getByTestId('word-klant-password'), { target: { value: 'geheim123' } });
  fireEvent.change(screen.getByTestId('word-klant-password-confirm'), {
    target: { value: 'geheim123' },
  });
  fireEvent.change(screen.getByTestId('word-klant-address'), {
    target: { value: 'Teststraat 1' },
  });
  fireEvent.change(screen.getByTestId('word-klant-postcode'), { target: { value: '1234 AB' } });
  fireEvent.change(screen.getByTestId('word-klant-city'), { target: { value: 'Teststad' } });
}

beforeEach(() => {
  createUserMock.mockReset();
  signOutMock.mockReset();
  setDocMock.mockReset();
  deleteUserMock.mockReset();
});

describe('RegistrationForm', () => {
  it('shows the 3 business fields as required, with no Particulier/Zakelijk toggle', () => {
    renderForm();
    expect(screen.getByTestId('word-klant-company-name')).toBeRequired();
    expect(screen.getByTestId('word-klant-kvk')).toBeRequired();
    expect(screen.getByTestId('word-klant-contact-person')).toBeRequired();
    expect(screen.queryByTestId('word-klant-type-zakelijk')).not.toBeInTheDocument();
    expect(screen.queryByTestId('word-klant-type-particulier')).not.toBeInTheDocument();
  });

  it('has no separate Naam field', () => {
    renderForm();
    expect(screen.queryByTestId('word-klant-name')).not.toBeInTheDocument();
  });

  it('marks the shared fields as required', () => {
    renderForm();
    expect(screen.getByTestId('word-klant-email')).toBeRequired();
    expect(screen.getByTestId('word-klant-phone')).toBeRequired();
    expect(screen.getByTestId('word-klant-password')).toBeRequired();
    expect(screen.getByTestId('word-klant-password-confirm')).toBeRequired();
    expect(screen.getByTestId('word-klant-address')).toBeRequired();
    expect(screen.getByTestId('word-klant-postcode')).toBeRequired();
    expect(screen.getByTestId('word-klant-city')).toBeRequired();
  });

  it('shows the 3 delivery-address fields only when the "different delivery address" checkbox is checked', () => {
    renderForm();
    expect(screen.queryByTestId('word-klant-delivery-address')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('word-klant-different-delivery'));
    expect(screen.getByTestId('word-klant-delivery-address')).toBeInTheDocument();
    expect(screen.getByTestId('word-klant-delivery-postcode')).toBeInTheDocument();
    expect(screen.getByTestId('word-klant-delivery-city')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('word-klant-different-delivery'));
    expect(screen.queryByTestId('word-klant-delivery-address')).not.toBeInTheDocument();
  });

  it('shows the 3 invoice-address fields only when the "different invoice address" checkbox is checked', () => {
    renderForm();
    expect(screen.queryByTestId('word-klant-invoice-address')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('word-klant-different-invoice'));
    expect(screen.getByTestId('word-klant-invoice-address')).toBeInTheDocument();
    expect(screen.getByTestId('word-klant-invoice-postcode')).toBeInTheDocument();
    expect(screen.getByTestId('word-klant-invoice-city')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('word-klant-different-invoice'));
    expect(screen.queryByTestId('word-klant-invoice-address')).not.toBeInTheDocument();
  });

  it('renders the contact-preference select with exactly the 3 options', () => {
    renderForm();
    const select = screen.getByTestId('word-klant-contact-preference') as HTMLSelectElement;
    const optionTexts = Array.from(select.options)
      .map((option) => option.text)
      .filter((text) => text !== 'Hoe wilt u gecontacteerd worden?');
    expect(optionTexts).toEqual(['E-mail', 'Telefonisch', 'WhatsApp']);
  });

  it('shows an error and does not submit when the passwords do not match', () => {
    renderForm();
    fireEvent.change(screen.getByTestId('word-klant-password'), { target: { value: 'geheim123' } });
    fireEvent.change(screen.getByTestId('word-klant-password-confirm'), {
      target: { value: 'anderswoord' },
    });
    fireEvent.submit(screen.getByTestId('word-klant-submit').closest('form')!);
    expect(screen.getByTestId('word-klant-password-error')).toHaveTextContent(
      'Wachtwoorden komen niet overeen.'
    );
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it('creates a Firebase account, saves a "Beoordelen" klanten document, signs out, and shows the confirmation screen', async () => {
    createUserMock.mockResolvedValue({ user: { uid: 'uid-123' } });
    setDocMock.mockResolvedValue(undefined);
    signOutMock.mockResolvedValue(undefined);
    renderForm();
    fillRequiredFields();

    fireEvent.submit(screen.getByTestId('word-klant-submit').closest('form')!);

    await waitFor(() => expect(screen.getByTestId('word-klant-confirmation')).toBeInTheDocument());

    expect(createUserMock).toHaveBeenCalledWith({}, 'jan@example.com', 'geheim123');
    expect(setDocMock).toHaveBeenCalledWith(
      { collection: 'klanten', id: 'uid-123' },
      expect.objectContaining({
        companyName: 'Testbedrijf BV',
        kvk: '12345678',
        contactPerson: 'Jan Jansen',
        email: 'jan@example.com',
        phone: '0612345678',
        address: 'Teststraat 1',
        postcode: '1234 AB',
        city: 'Teststad',
        status: 'Beoordelen',
        prijsgroep: '',
      })
    );
    expect(signOutMock).toHaveBeenCalledWith({});
  });

  it('shows a specific error when the email address is already in use', async () => {
    createUserMock.mockRejectedValue({ code: 'auth/email-already-in-use' });
    renderForm();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('word-klant-submit').closest('form')!);
    expect(await screen.findByTestId('word-klant-submit-error')).toHaveTextContent(
      'Dit e-mailadres is al geregistreerd.'
    );
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it('shows a specific error for a weak password', async () => {
    createUserMock.mockRejectedValue({ code: 'auth/weak-password' });
    renderForm();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('word-klant-submit').closest('form')!);
    expect(await screen.findByTestId('word-klant-submit-error')).toHaveTextContent(
      'Wachtwoord moet minimaal 6 tekens bevatten.'
    );
  });

  it('shows a generic error for any other failure', async () => {
    createUserMock.mockRejectedValue({ code: 'auth/network-request-failed' });
    renderForm();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('word-klant-submit').closest('form')!);
    expect(await screen.findByTestId('word-klant-submit-error')).toHaveTextContent(
      'Er is iets misgegaan, probeer het opnieuw.'
    );
  });

  it('cleans up the orphaned Firebase account when setDoc fails after account creation', async () => {
    const createdUser = { uid: 'uid-orphan' };
    createUserMock.mockResolvedValue({ user: createdUser });
    setDocMock.mockRejectedValue(new Error('firestore-unavailable'));
    deleteUserMock.mockResolvedValue(undefined);
    renderForm();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('word-klant-submit').closest('form')!);

    expect(await screen.findByTestId('word-klant-submit-error')).toHaveTextContent(
      'Er is iets misgegaan, probeer het opnieuw.'
    );
    expect(deleteUserMock).toHaveBeenCalledWith(createdUser);
  });
});
