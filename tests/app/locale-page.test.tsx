import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LocalePage from '@/app/[locale]/page';
import messages from '../../messages/nl.json';

describe('LocalePage', () => {
  it('renders all five sections for the nl locale', () => {
    render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <LocalePage />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Kunst op glas')).toBeInTheDocument();
    expect(screen.getByText('Over ons')).toBeInTheDocument();
    expect(screen.getByText('Waarom Glassart & Design')).toBeInTheDocument();
    expect(screen.getByText('Uitgelichte werken')).toBeInTheDocument();
    expect(screen.getAllByTestId('work-placeholder')).toHaveLength(3);
  });
});
