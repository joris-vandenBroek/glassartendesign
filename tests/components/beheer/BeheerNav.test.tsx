import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BeheerNav } from '@/components/beheer/BeheerNav';
import messages from '../../../messages/nl.json';

function renderNav(activeSection: 'klanten' | 'facturen' = 'klanten') {
  const onSelect = vi.fn();
  const onLogout = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <BeheerNav
        activeSection={activeSection}
        onSelect={onSelect}
        onLogout={onLogout}
        klantenCount={3}
        facturenCount={7}
      />
    </NextIntlClientProvider>
  );
  return { onSelect, onLogout };
}

describe('BeheerNav', () => {
  it('renders the 2 active items with their counters, and the 7 disabled placeholder items', () => {
    renderNav();
    expect(screen.getByTestId('beheer-nav-klanten')).toHaveTextContent('Klanten');
    expect(screen.getByTestId('beheer-nav-klanten')).toHaveTextContent('3');
    expect(screen.getByTestId('beheer-nav-facturen')).toHaveTextContent('Facturen');
    expect(screen.getByTestId('beheer-nav-facturen')).toHaveTextContent('7');

    ['bestellingen', 'retouren', 'prijsgroepen', 'maten', 'materialen', 'kunstwerken', 'glassartDesign'].forEach(
      (id) => {
        expect(screen.getByTestId(`beheer-nav-${id}`)).toBeDisabled();
      }
    );
  });

  it('marks the active section with aria-current', () => {
    renderNav('facturen');
    expect(screen.getByTestId('beheer-nav-facturen')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByTestId('beheer-nav-klanten')).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the clicked section id', () => {
    const { onSelect } = renderNav();
    fireEvent.click(screen.getByTestId('beheer-nav-facturen'));
    expect(onSelect).toHaveBeenCalledWith('facturen');
  });

  it('calls onLogout when the logout button is clicked', () => {
    const { onLogout } = renderNav();
    fireEvent.click(screen.getByTestId('beheer-nav-logout'));
    expect(onLogout).toHaveBeenCalled();
  });
});
