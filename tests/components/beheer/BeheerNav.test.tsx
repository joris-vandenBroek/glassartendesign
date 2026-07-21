import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BeheerNav, type BeheerSection } from '@/components/beheer/BeheerNav';
import messages from '../../../messages/nl.json';

function renderNav(activeSection: BeheerSection = 'klanten') {
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
        materiaalsoortenCount={4}
        materialenCount={6}
        matenCount={2}
      />
    </NextIntlClientProvider>
  );
  return { onSelect, onLogout };
}

describe('BeheerNav', () => {
  it('renders the 5 active items with their counters, and the 5 disabled placeholder items', () => {
    renderNav();
    expect(screen.getByTestId('beheer-nav-klanten')).toHaveTextContent('Klanten');
    expect(screen.getByTestId('beheer-nav-klanten')).toHaveTextContent('3');
    expect(screen.getByTestId('beheer-nav-facturen')).toHaveTextContent('Facturen');
    expect(screen.getByTestId('beheer-nav-facturen')).toHaveTextContent('7');
    expect(screen.getByTestId('beheer-nav-materiaalsoorten')).toHaveTextContent('Materiaalsoorten');
    expect(screen.getByTestId('beheer-nav-materiaalsoorten')).toHaveTextContent('4');
    expect(screen.getByTestId('beheer-nav-materialen')).toHaveTextContent('Materialen');
    expect(screen.getByTestId('beheer-nav-materialen')).toHaveTextContent('6');
    expect(screen.getByTestId('beheer-nav-maten')).toHaveTextContent('Maten');
    expect(screen.getByTestId('beheer-nav-maten')).toHaveTextContent('2');

    ['bestellingen', 'retouren', 'prijsgroepen', 'kunstwerken', 'glassartDesign'].forEach((id) => {
      expect(screen.getByTestId(`beheer-nav-${id}`)).toBeDisabled();
    });
  });

  it('marks the active section with aria-current', () => {
    renderNav('materialen');
    expect(screen.getByTestId('beheer-nav-materialen')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByTestId('beheer-nav-klanten')).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the clicked section id', () => {
    const { onSelect } = renderNav();
    fireEvent.click(screen.getByTestId('beheer-nav-materiaalsoorten'));
    expect(onSelect).toHaveBeenCalledWith('materiaalsoorten');
  });

  it('calls onLogout when the logout button is clicked', () => {
    const { onLogout } = renderNav();
    fireEvent.click(screen.getByTestId('beheer-nav-logout'));
    expect(onLogout).toHaveBeenCalled();
  });
});
