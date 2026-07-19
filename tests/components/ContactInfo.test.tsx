import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { ContactInfo } from '@/components/ContactInfo';
import messages from '../../messages/nl.json';

describe('ContactInfo', () => {
  it('renders the real visiting address and a directions link', () => {
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(screen.getByTestId('contact-address')).toHaveTextContent(
      'Den Heuvel 21, 5688 EM Oirschot'
    );
    expect(screen.getByTestId('contact-directions')).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps')
    );
  });

  it('embeds a Google Maps iframe for the address', () => {
    renderWithIntl(<ContactInfo />, 'nl', messages);
    const iframe = screen.getByTestId('contact-map');
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('output=embed'));
  });

  it('renders both real contact persons with correct tel links', () => {
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(screen.getByText('Paul van den Hout')).toBeInTheDocument();
    expect(screen.getByTestId('contact-phone-projects')).toHaveAttribute(
      'href',
      'tel:+31651404089'
    );
    expect(screen.getByText('Hem Brekoo')).toBeInTheDocument();
    expect(screen.getByTestId('contact-phone-b2b')).toHaveAttribute(
      'href',
      'tel:+31653736756'
    );
  });

  it('renders a mailto link with the real email address', () => {
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(screen.getByTestId('contact-email')).toHaveAttribute(
      'href',
      'mailto:info@glassartdesign.nl'
    );
  });

  it('renders a WhatsApp link', () => {
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(screen.getByTestId('contact-whatsapp')).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/')
    );
  });

  it('renders opening hours and the company registration block', () => {
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(screen.getByText('Openingstijden')).toBeInTheDocument();
    expect(screen.getByText('Bedrijfsgegevens')).toBeInTheDocument();
    expect(screen.getByText(/KvK-nummer/)).toBeInTheDocument();
    expect(screen.getByText(/BTW-nummer/)).toBeInTheDocument();
    expect(screen.getByText(/IBAN/)).toBeInTheDocument();
  });
});
