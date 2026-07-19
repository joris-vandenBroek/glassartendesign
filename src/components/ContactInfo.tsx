'use client';

import { useTranslations } from 'next-intl';

const ADDRESS = 'Den Heuvel 21, 5688 EM Oirschot';
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  ADDRESS
)}`;
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  ADDRESS
)}&output=embed`;
const WHATSAPP_NUMBER = '31600000000';

export function ContactInfo() {
  const t = useTranslations('contactPage');

  return (
    <div className="flex flex-col gap-6 text-sm text-white/80">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
          {t('visitLabel')}
        </p>
        <p data-testid="contact-address" className="mt-2">
          {ADDRESS}
        </p>
        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="contact-directions"
          className="mt-1 inline-block text-xs underline decoration-white/30"
        >
          {t('planRoute')}
        </a>
        <iframe
          data-testid="contact-map"
          src={MAP_EMBED_URL}
          title={t('visitLabel')}
          loading="lazy"
          className="mt-4 h-48 w-full rounded border border-white/10"
        />
      </div>

      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
          {t('contactsLabel')}
        </p>
        <p className="mt-2">
          <strong className="text-white">Paul van den Hout</strong> — {t('projectsContact')}
          <br />
          <a
            href="tel:+31651404089"
            data-testid="contact-phone-projects"
            className="underline decoration-white/30"
          >
            06 51404089
          </a>
        </p>
        <p className="mt-3">
          <strong className="text-white">Hem Brekoo</strong> — {t('b2bContact')}
          <br />
          <a
            href="tel:+31653736756"
            data-testid="contact-phone-b2b"
            className="underline decoration-white/30"
          >
            06 53736756
          </a>
        </p>
      </div>

      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
          {t('emailLabel')}
        </p>
        <a
          href="mailto:info@glassartdesign.nl"
          data-testid="contact-email"
          className="mt-2 inline-block underline decoration-white/30"
        >
          info@glassartdesign.nl
        </a>
      </div>

      <div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="contact-whatsapp"
          className="inline-block rounded-sm bg-silver px-4 py-2 text-xs tracking-[0.15em] text-ink"
        >
          {t('whatsappLabel')}
        </a>
      </div>

      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
          {t('hoursLabel')}
        </p>
        <p className="mt-2">{t('hoursValue')}</p>
      </div>

      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
          {t('companyLabel')}
        </p>
        <p className="mt-2">
          {t('kvkLabel')}: 12345678
          <br />
          {t('btwLabel')}: NL123456789B01
          <br />
          {t('ibanLabel')}: NL00 BANK 0123 4567 89
        </p>
      </div>
    </div>
  );
}
