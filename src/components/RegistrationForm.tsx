'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

type ClientType = 'particulier' | 'zakelijk';

export function RegistrationForm() {
  const t = useTranslations('registrationPage');
  const [clientType, setClientType] = useState<ClientType>('zakelijk');
  const [showDeliveryAddress, setShowDeliveryAddress] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div data-testid="word-klant-confirmation" className="text-center text-white/80">
        <p className="text-lg text-white">{t('confirmationTitle')}</p>
        <p className="mt-2 text-sm">{t('confirmationMessage')}</p>
      </div>
    );
  }

  const fieldClassName = 'rounded-sm bg-black/40 px-3 py-2 text-sm text-white';
  const labelClassName = 'flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm text-white/80">
      <div className="flex gap-2">
        <button
          type="button"
          data-testid="word-klant-type-zakelijk"
          aria-pressed={clientType === 'zakelijk'}
          onClick={() => setClientType('zakelijk')}
          className={
            clientType === 'zakelijk'
              ? 'flex-1 rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink'
              : 'flex-1 rounded-sm border border-white/20 px-4 py-2 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white'
          }
        >
          {t('typeZakelijk')}
        </button>
        <button
          type="button"
          data-testid="word-klant-type-particulier"
          aria-pressed={clientType === 'particulier'}
          onClick={() => setClientType('particulier')}
          className={
            clientType === 'particulier'
              ? 'flex-1 rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink'
              : 'flex-1 rounded-sm border border-white/20 px-4 py-2 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white'
          }
        >
          {t('typeParticulier')}
        </button>
      </div>

      <label className={labelClassName}>
        {t('labelName')}
        <input type="text" name="name" required data-testid="word-klant-name" className={fieldClassName} />
      </label>

      <label className={labelClassName}>
        {t('labelEmail')}
        <input type="email" name="email" required data-testid="word-klant-email" className={fieldClassName} />
      </label>

      <label className={labelClassName}>
        {t('labelPhone')}
        <input type="tel" name="phone" required data-testid="word-klant-phone" className={fieldClassName} />
      </label>

      <label className={labelClassName}>
        {t('labelPassword')}
        <input
          type="password"
          name="password"
          required
          data-testid="word-klant-password"
          className={fieldClassName}
        />
      </label>

      <label className={labelClassName}>
        {t('labelAddress')}
        <input type="text" name="address" required data-testid="word-klant-address" className={fieldClassName} />
      </label>

      <label className={labelClassName}>
        {t('labelPostcode')}
        <input
          type="text"
          name="postcode"
          required
          data-testid="word-klant-postcode"
          className={fieldClassName}
        />
      </label>

      <label className={labelClassName}>
        {t('labelCity')}
        <input type="text" name="city" required data-testid="word-klant-city" className={fieldClassName} />
      </label>

      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
        <input
          type="checkbox"
          data-testid="word-klant-different-delivery"
          checked={showDeliveryAddress}
          onChange={(event) => setShowDeliveryAddress(event.target.checked)}
        />
        {t('differentDeliveryLabel')}
      </label>

      {showDeliveryAddress && (
        <>
          <label className={labelClassName}>
            {t('labelDeliveryAddress')}
            <input
              type="text"
              name="deliveryAddress"
              data-testid="word-klant-delivery-address"
              className={fieldClassName}
            />
          </label>

          <label className={labelClassName}>
            {t('labelDeliveryPostcode')}
            <input
              type="text"
              name="deliveryPostcode"
              data-testid="word-klant-delivery-postcode"
              className={fieldClassName}
            />
          </label>

          <label className={labelClassName}>
            {t('labelDeliveryCity')}
            <input
              type="text"
              name="deliveryCity"
              data-testid="word-klant-delivery-city"
              className={fieldClassName}
            />
          </label>
        </>
      )}

      {clientType === 'zakelijk' && (
        <>
          <label className={labelClassName}>
            {t('labelCompanyName')}
            <input
              type="text"
              name="companyName"
              required
              data-testid="word-klant-company-name"
              className={fieldClassName}
            />
          </label>

          <label className={labelClassName}>
            {t('labelKvk')}
            <input type="text" name="kvk" required data-testid="word-klant-kvk" className={fieldClassName} />
          </label>

          <label className={labelClassName}>
            {t('labelContactPerson')}
            <input
              type="text"
              name="contactPerson"
              required
              data-testid="word-klant-contact-person"
              className={fieldClassName}
            />
          </label>
        </>
      )}

      <button
        type="submit"
        data-testid="word-klant-submit"
        className="mt-2 rounded-sm bg-silver px-4 py-2.5 text-xs tracking-[0.15em] text-ink"
      >
        {t('submit')}
      </button>
    </form>
  );
}
