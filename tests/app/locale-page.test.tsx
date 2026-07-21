import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LocalePage from '@/app/[locale]/page';
import messages from '../../messages/nl.json';

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  getDocs: vi.fn().mockResolvedValue({
    empty: true,
    docs: [],
  }),
  addDoc: vi.fn(),
}));

describe('LocalePage', () => {
  it('renders all five sections for the nl locale', async () => {
    render(
      <NextIntlClientProvider locale="nl" messages={messages}>
        <LocalePage />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Kunst op glas')).toBeInTheDocument();
    expect(screen.getByText('Over ons')).toBeInTheDocument();
    expect(screen.getByText('Waarom Glassart & Design')).toBeInTheDocument();
    expect(await screen.findByText('Uitgelichte werken')).toBeInTheDocument();
  });
});
