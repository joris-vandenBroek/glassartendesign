import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { ContactInfo } from '@/components/ContactInfo';
import messages from '../../messages/nl.json';

const getDocMock = vi.fn();
const setDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  setDoc: (...args: unknown[]) => setDocMock(...args),
}));

const BEDRIJFSGEGEVENS = {
  bezoekadres: 'Den Heuvel 21, 5688 EM Oirschot',
  email: 'info@glassartdesign.nl',
  whatsappNummer: '31600000000',
  iban: 'NL00 BANK 0123 4567 89',
  kvkNummer: '12345678',
  btwNummer: 'NL123456789B01',
  openingstijden: { nl: 'Ma–vr: 09:00 – 17:00', en: 'Mon-Fri: 9-17', fr: '', de: '' },
  contactpersonen: [
    {
      id: 'seed-paul',
      naam: 'Paul van den Hout',
      telefoon: '+31651404089',
      rol: { nl: 'Voor projecten, hotels etc.', en: '', fr: '', de: '' },
    },
    {
      id: 'seed-hem',
      naam: 'Hem Brekoo',
      telefoon: '+31653736756',
      rol: { nl: 'Voor zakelijke klanten (B2B)', en: '', fr: '', de: '' },
    },
  ],
};

function mockDoc(data: typeof BEDRIJFSGEGEVENS | null) {
  getDocMock.mockResolvedValue({
    exists: () => data !== null,
    data: () => data,
  });
}

beforeEach(() => {
  getDocMock.mockReset();
  setDocMock.mockReset();
});

describe('ContactInfo', () => {
  it('renders the visiting address and a directions link from Firestore', async () => {
    mockDoc(BEDRIJFSGEGEVENS);
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(await screen.findByTestId('contact-address')).toHaveTextContent(
      'Den Heuvel 21, 5688 EM Oirschot'
    );
    expect(screen.getByTestId('contact-directions')).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps')
    );
  });

  it('embeds a Google Maps iframe for the address', async () => {
    mockDoc(BEDRIJFSGEGEVENS);
    renderWithIntl(<ContactInfo />, 'nl', messages);
    const iframe = await screen.findByTestId('contact-map');
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('output=embed'));
  });

  it('renders all contact persons with correct tel links and the NL role text', async () => {
    mockDoc(BEDRIJFSGEGEVENS);
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(await screen.findByTestId('contact-person-0')).toHaveTextContent('Paul van den Hout');
    expect(screen.getByTestId('contact-person-0')).toHaveTextContent('Voor projecten, hotels etc.');
    expect(screen.getByTestId('contact-phone-0')).toHaveAttribute('href', 'tel:+31651404089');
    expect(screen.getByTestId('contact-person-1')).toHaveTextContent('Hem Brekoo');
    expect(screen.getByTestId('contact-phone-1')).toHaveAttribute('href', 'tel:+31653736756');
  });

  it('falls back to the NL role text when the active locale has no translation', async () => {
    mockDoc(BEDRIJFSGEGEVENS);
    renderWithIntl(<ContactInfo />, 'en', messages);
    expect(await screen.findByTestId('contact-person-0')).toHaveTextContent(
      'Voor projecten, hotels etc.'
    );
  });

  it('renders a mailto link with the Firestore email address', async () => {
    mockDoc(BEDRIJFSGEGEVENS);
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(await screen.findByTestId('contact-email')).toHaveAttribute(
      'href',
      'mailto:info@glassartdesign.nl'
    );
  });

  it('renders a WhatsApp link with the Firestore number', async () => {
    mockDoc(BEDRIJFSGEGEVENS);
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(await screen.findByTestId('contact-whatsapp')).toHaveAttribute(
      'href',
      'https://wa.me/31600000000'
    );
  });

  it('renders opening hours for the active locale and the company registration block', async () => {
    mockDoc(BEDRIJFSGEGEVENS);
    renderWithIntl(<ContactInfo />, 'en', messages);
    expect(await screen.findByText('Mon-Fri: 9-17')).toBeInTheDocument();
    expect(screen.getByText(/KvK-nummer/)).toBeInTheDocument();
    expect(screen.getByText(/BTW-nummer/)).toBeInTheDocument();
    expect(screen.getByText(/IBAN/)).toBeInTheDocument();
  });

  it('renders nothing while the document has not loaded yet', () => {
    getDocMock.mockReturnValue(new Promise(() => {}));
    renderWithIntl(<ContactInfo />, 'nl', messages);
    expect(screen.queryByTestId('contact-address')).not.toBeInTheDocument();
  });
});
