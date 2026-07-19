import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BecomeClientCta } from '@/components/BecomeClientCta';
import { MockAuthProvider } from '@/lib/useMockAuth';
import messages from '../../messages/nl.json';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderBecomeClientCta() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <BecomeClientCta />
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('BecomeClientCta', () => {
  it('shows the "Word klant" link pointing at /word-klant when logged out', () => {
    renderBecomeClientCta();
    expect(screen.getByTestId('segment-cta')).toHaveAttribute('href', '/word-klant');
  });

  it('hides the link when already logged in', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderBecomeClientCta();
    expect(screen.queryByTestId('segment-cta')).not.toBeInTheDocument();
  });
});
