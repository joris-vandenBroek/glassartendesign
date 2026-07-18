import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      <div>
        <LanguageSwitcher />
        <button data-testid="outside">Outside</button>
      </div>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  replaceMock.mockClear();
});

describe('LanguageSwitcher', () => {
  it('shows the active locale on the toggle button, menu closed by default', () => {
    renderSwitcher('de');
    expect(screen.getByTestId('language-switcher-toggle')).toHaveTextContent('DE');
    expect(screen.queryByTestId('language-switcher-menu')).not.toBeInTheDocument();
  });

  it('opens the menu with all 4 locale options when the toggle is clicked', () => {
    renderSwitcher('nl');
    fireEvent.click(screen.getByTestId('language-switcher-toggle'));
    expect(screen.getByTestId('language-option-nl')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-de')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-fr')).toBeInTheDocument();
  });

  it('disables the option matching the active locale', () => {
    renderSwitcher('de');
    fireEvent.click(screen.getByTestId('language-switcher-toggle'));
    expect(screen.getByTestId('language-option-de')).toBeDisabled();
    expect(screen.getByTestId('language-option-nl')).not.toBeDisabled();
  });

  it('switches locale and closes the menu when a different option is clicked', () => {
    renderSwitcher('nl');
    fireEvent.click(screen.getByTestId('language-switcher-toggle'));
    fireEvent.click(screen.getByTestId('language-option-fr'));
    expect(replaceMock).toHaveBeenCalledWith('/', { locale: 'fr' });
    expect(screen.queryByTestId('language-switcher-menu')).not.toBeInTheDocument();
  });

  it('closes the menu when clicking outside', () => {
    renderSwitcher('nl');
    fireEvent.click(screen.getByTestId('language-switcher-toggle'));
    expect(screen.getByTestId('language-switcher-menu')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('language-switcher-menu')).not.toBeInTheDocument();
  });
});
