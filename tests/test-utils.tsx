import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';

export function renderWithIntl(
  ui: ReactElement,
  locale: string,
  messages: AbstractIntlMessages
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}
