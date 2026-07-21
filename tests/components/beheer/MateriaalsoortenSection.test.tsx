import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { MateriaalsoortenSection } from '@/components/beheer/MateriaalsoortenSection';
import type { Materiaalsoort, Materiaal } from '@/components/beheer/materiaalTypes';
import messages from '../../../messages/nl.json';

const SOORTEN: Materiaalsoort[] = [
  { id: 'soort-1', omschrijving: 'Veiligheidsglas' },
  { id: 'soort-2', omschrijving: 'Dibond' },
];

const MATERIALEN: Materiaal[] = [
  { id: 'mat-1', materiaalsoortId: 'soort-1', materiaaldikte: 4, omschrijving: 'Test' },
];

function renderSection(overrides: Partial<React.ComponentProps<typeof MateriaalsoortenSection>> = {}) {
  const onAdd = vi.fn().mockResolvedValue(true);
  const onUpdate = vi.fn().mockResolvedValue(true);
  const onRemove = vi.fn().mockResolvedValue(true);
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MateriaalsoortenSection
        materiaalsoorten={SOORTEN}
        materialen={MATERIALEN}
        loadError={null}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        {...overrides}
      />
    </NextIntlClientProvider>
  );
  return { onAdd, onUpdate, onRemove };
}

describe('MateriaalsoortenSection', () => {
  it('shows the load error instead of the table when loadError is set', () => {
    renderSection({ loadError: 'Kon niet laden.' });
    expect(screen.getByTestId('materiaalsoorten-error')).toHaveTextContent('Kon niet laden.');
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
  });

  it('renders nothing while materiaalsoorten is null and there is no error', () => {
    renderSection({ materiaalsoorten: null });
    expect(screen.queryByTestId('materiaalsoorten-section')).not.toBeInTheDocument();
  });

  it('lists the materiaalsoorten in the table', () => {
    renderSection();
    expect(screen.getByTestId('data-table-row-soort-1')).toHaveTextContent('Veiligheidsglas');
    expect(screen.getByTestId('data-table-row-soort-2')).toHaveTextContent('Dibond');
  });

  it('adds a new materiaalsoort and closes the modal', async () => {
    const { onAdd } = renderSection();
    fireEvent.click(screen.getByTestId('materiaalsoorten-add'));
    fireEvent.change(screen.getByTestId('materiaalsoort-modal-omschrijving'), {
      target: { value: 'Acryl' },
    });
    fireEvent.click(screen.getByTestId('materiaalsoort-modal-opslaan'));
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ omschrijving: 'Acryl' }));
    await waitFor(() => expect(screen.queryByTestId('materiaalsoort-modal')).not.toBeInTheDocument());
  });

  it('disables Opslaan until omschrijving is filled in', () => {
    renderSection();
    fireEvent.click(screen.getByTestId('materiaalsoorten-add'));
    expect(screen.getByTestId('materiaalsoort-modal-opslaan')).toBeDisabled();
    fireEvent.change(screen.getByTestId('materiaalsoort-modal-omschrijving'), { target: { value: 'X' } });
    expect(screen.getByTestId('materiaalsoort-modal-opslaan')).not.toBeDisabled();
  });

  it('opens a row for editing pre-filled, and updates it', async () => {
    const { onUpdate } = renderSection();
    fireEvent.click(screen.getByTestId('data-table-row-soort-2'));
    expect(screen.getByTestId('materiaalsoort-modal-omschrijving')).toHaveValue('Dibond');
    fireEvent.change(screen.getByTestId('materiaalsoort-modal-omschrijving'), { target: { value: 'Dibond 3mm' } });
    fireEvent.click(screen.getByTestId('materiaalsoort-modal-opslaan'));
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith('soort-2', { omschrijving: 'Dibond 3mm' }));
  });

  it('blocks deleting a materiaalsoort that still has materialen referencing it', async () => {
    const { onRemove } = renderSection();
    fireEvent.click(screen.getByTestId('data-table-row-soort-1'));
    fireEvent.click(screen.getByTestId('materiaalsoort-modal-verwijderen'));
    expect(await screen.findByTestId('materiaalsoort-modal-error')).toHaveTextContent(
      'Deze materiaalsoort is nog gekoppeld aan materialen en kan niet verwijderd worden.'
    );
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('deletes a materiaalsoort with no linked materialen', async () => {
    const { onRemove } = renderSection();
    fireEvent.click(screen.getByTestId('data-table-row-soort-2'));
    fireEvent.click(screen.getByTestId('materiaalsoort-modal-verwijderen'));
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith('soort-2'));
    await waitFor(() => expect(screen.queryByTestId('materiaalsoort-modal')).not.toBeInTheDocument());
  });
});
