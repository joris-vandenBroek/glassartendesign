import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BecomeClientCta } from '@/components/BecomeClientCta';
import { MockAuthProvider } from '@/lib/useMockAuth';
import messages from '../../messages/nl.json';

function renderBecomeClientCta() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <BecomeClientCta contactHref="/nl/#contact" />
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('BecomeClientCta', () => {
  it('shows the "Word klant" link when logged out', () => {
    renderBecomeClientCta();
    expect(screen.getByTestId('segment-cta')).toHaveAttribute('href', '/nl/#contact');
  });

  it('hides the link when already logged in', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderBecomeClientCta();
    expect(screen.queryByTestId('segment-cta')).not.toBeInTheDocument();
  });
});
