import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ConversationsSection } from '@/components/account/ConversationsSection';
import messages from '../../../messages/nl.json';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <ConversationsSection />
    </NextIntlClientProvider>
  );
}

describe('ConversationsSection', () => {
  it('renders all 4 mock conversations with date, time and topic', () => {
    renderSection();
    expect(screen.getByTestId('conversation-CONV-1')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-CONV-4')).toBeInTheDocument();
    expect(screen.getByText('2026-07-10')).toBeInTheDocument();
    expect(screen.getByText('14:32')).toBeInTheDocument();
    expect(screen.getByText('Vraag over levertijd')).toBeInTheDocument();
  });
});
