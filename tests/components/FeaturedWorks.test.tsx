import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { FeaturedWorks } from '@/components/FeaturedWorks';
import messages from '../../messages/nl.json';

const getDocsMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  addDoc: vi.fn(),
}));

function makeSnapshot(docsData: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    empty: docsData.length === 0,
    docs: docsData.map(({ id, data }) => ({ id, data: () => data })),
  };
}

function makeKunstwerk(id: string) {
  return {
    id,
    data: {
      foto: `https://example.com/${id}.jpg`,
      segmentIds: ['seg-1'],
      materiaalIds: ['mat-1'],
      maatIds: ['maat-1'],
      prijzen: [{ materiaalId: 'mat-1', maatId: 'maat-1', prijs: 150 }],
      omschrijvingNl: `Kunstwerk ${id}`,
      omschrijvingFr: '',
      omschrijvingDe: '',
      omschrijvingEn: '',
    },
  };
}

beforeEach(() => {
  getDocsMock.mockReset();
});

describe('FeaturedWorks', () => {
  it('renders the section label and exactly 3 featured works when 5 kunstwerken exist', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot(['a', 'b', 'c', 'd', 'e'].map(makeKunstwerk)));
    renderWithIntl(<FeaturedWorks />, 'nl', messages);
    expect(screen.getByText('Uitgelichte werken')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId('featured-work')).toHaveLength(3));
  });

  it('shows all kunstwerken (not padded) when fewer than 3 exist', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot(['a', 'b'].map(makeKunstwerk)));
    renderWithIntl(<FeaturedWorks />, 'nl', messages);
    await waitFor(() => expect(screen.getAllByTestId('featured-work')).toHaveLength(2));
  });

  it('shows a watermark overlay on each featured photo', async () => {
    getDocsMock.mockResolvedValue(makeSnapshot(['a', 'b', 'c'].map(makeKunstwerk)));
    renderWithIntl(<FeaturedWorks />, 'nl', messages);
    await waitFor(() => expect(screen.getAllByTestId('watermark-overlay')).toHaveLength(3));
  });
});
