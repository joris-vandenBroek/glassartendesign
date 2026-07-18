import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { SegmentCta } from '@/components/SegmentCta';
import { MockAuthProvider } from '@/lib/useMockAuth';
import messages from '../../messages/nl.json';

function renderSegmentCta() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MockAuthProvider>
        <SegmentCta contactHref="/nl/#contact" />
      </MockAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('SegmentCta', () => {
  it('shows the "Word klant" link when logged out', () => {
    renderSegmentCta();
    expect(screen.getByTestId('segment-cta')).toHaveAttribute('href', '/nl/#contact');
  });

  it('hides the link when already logged in', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    renderSegmentCta();
    expect(screen.queryByTestId('segment-cta')).not.toBeInTheDocument();
  });
});
