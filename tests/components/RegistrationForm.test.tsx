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
  it('defaults to "Zakelijk" selected, with the 3 business fields shown', () => {
    renderForm();
    expect(screen.getByTestId('word-klant-type-zakelijk')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('word-klant-type-particulier')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByTestId('word-klant-company-name')).toBeRequired();
    expect(screen.getByTestId('word-klant-kvk')).toBeRequired();
    expect(screen.getByTestId('word-klant-contact-person')).toBeRequired();
  });

  it('marks the shared fields as required', () => {
    renderForm();
    expect(screen.getByTestId('word-klant-name')).toBeRequired();
    expect(screen.getByTestId('word-klant-email')).toBeRequired();
    expect(screen.getByTestId('word-klant-phone')).toBeRequired();
    expect(screen.getByTestId('word-klant-password')).toBeRequired();
    expect(screen.getByTestId('word-klant-address')).toBeRequired();
    expect(screen.getByTestId('word-klant-postcode')).toBeRequired();
    expect(screen.getByTestId('word-klant-city')).toBeRequired();
  });

  it('hides the 3 business fields when switching to "Particulier", shows them again when switching back to "Zakelijk"', () => {
    renderForm();
    expect(screen.getByTestId('word-klant-company-name')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('word-klant-type-particulier'));
    expect(screen.queryByTestId('word-klant-company-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('word-klant-kvk')).not.toBeInTheDocument();
    expect(screen.queryByTestId('word-klant-contact-person')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('word-klant-type-zakelijk'));
    expect(screen.getByTestId('word-klant-company-name')).toBeRequired();
    expect(screen.getByTestId('word-klant-kvk')).toBeRequired();
    expect(screen.getByTestId('word-klant-contact-person')).toBeRequired();
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

  it('shows the confirmation screen and hides the form after submit, without a real submission', () => {
    renderForm();
    fireEvent.click(screen.getByTestId('word-klant-type-particulier'));
    fireEvent.change(screen.getByTestId('word-klant-name'), { target: { value: 'Jan Jansen' } });
    fireEvent.change(screen.getByTestId('word-klant-email'), {
      target: { value: 'jan@example.com' },
    });
    fireEvent.change(screen.getByTestId('word-klant-phone'), { target: { value: '0612345678' } });
    fireEvent.change(screen.getByTestId('word-klant-password'), {
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
