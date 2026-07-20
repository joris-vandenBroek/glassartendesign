import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { RegistrationForm } from '@/components/RegistrationForm';
import messages from '../../messages/nl.json';

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <RegistrationForm />
    </NextIntlClientProvider>
  );
}

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
    expect(screen.queryByTestId('word-klant-confirmation')).not.toBeInTheDocument();
  });

  it('shows the confirmation screen and hides the form after submit, without a real submission', () => {
    renderForm();
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
    fireEvent.change(screen.getByTestId('word-klant-password'), {
      target: { value: 'geheim123' },
    });
    fireEvent.change(screen.getByTestId('word-klant-password-confirm'), {
      target: { value: 'geheim123' },
    });
    fireEvent.change(screen.getByTestId('word-klant-address'), {
      target: { value: 'Teststraat 1' },
    });
    fireEvent.change(screen.getByTestId('word-klant-postcode'), {
      target: { value: '1234 AB' },
    });
    fireEvent.change(screen.getByTestId('word-klant-city'), { target: { value: 'Teststad' } });

    fireEvent.submit(screen.getByTestId('word-klant-submit').closest('form')!);

    expect(screen.getByTestId('word-klant-confirmation')).toBeInTheDocument();
    expect(screen.getByText('Aanvraag ontvangen')).toBeInTheDocument();
    expect(screen.queryByTestId('word-klant-submit')).not.toBeInTheDocument();
  });
});
