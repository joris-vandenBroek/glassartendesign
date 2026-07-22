import type { Bedrijfsgegevens } from '@/components/beheer/bedrijfsgegevensTypes';

export const BEDRIJFSGEGEVENS_SEED: Bedrijfsgegevens = {
  bezoekadres: 'Den Heuvel 21, 5688 EM Oirschot',
  email: 'info@glassartdesign.nl',
  whatsappNummer: '31600000000',
  iban: 'NL00 BANK 0123 4567 89',
  kvkNummer: '12345678',
  btwNummer: 'NL123456789B01',
  openingstijden: { nl: 'Ma–vr: 09:00 – 17:00', en: '', fr: '', de: '' },
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
