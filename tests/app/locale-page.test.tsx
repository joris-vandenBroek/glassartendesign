import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LocalePage from '@/app/[locale]/page';
import messages from '../../messages/nl.json';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('LocalePage', () => {
  it('renders all four sections and the language switcher for the nl locale', () => {
    render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <LocalePage />
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    expect(screen.getByText('Kunst op glas,')).toBeInTheDocument();
    expect(screen.getByText('Over ons')).toBeInTheDocument();
    expect(screen.getByText('Uitgelichte werken')).toBeInTheDocument();
    expect(screen.getAllByTestId('work-placeholder')).toHaveLength(3);
    expect(
      screen.getByRole('link', { name: 'info@glassartanddesign.nl' })
    ).toBeInTheDocument();
  });
});
