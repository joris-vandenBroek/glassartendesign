import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const replaceMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: replaceMock }),
}));

function renderSwitcher(locale: string) {
  return render(
    <NextIntlClientProvider locale={locale} messages={{}}>
      <LanguageSwitcher />
    </NextIntlClientProvider>
  );
}

describe('LanguageSwitcher', () => {
  it('renders one option per supported locale', () => {
    renderSwitcher('nl');
    expect(screen.getByTestId('language-option-nl')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-de')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-fr')).toBeInTheDocument();
  });

  it('disables the option matching the active locale', () => {
    renderSwitcher('de');
    expect(screen.getByTestId('language-option-de')).toBeDisabled();
    expect(screen.getByTestId('language-option-nl')).not.toBeDisabled();
  });

  it('switches locale when a different option is clicked', () => {
    renderSwitcher('nl');
    screen.getByTestId('language-option-fr').click();
    expect(replaceMock).toHaveBeenCalledWith('/', { locale: 'fr' });
  });
});
