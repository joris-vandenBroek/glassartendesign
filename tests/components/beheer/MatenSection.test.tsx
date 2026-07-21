import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { MatenSection } from '@/components/beheer/MatenSection';
import type { Maat } from '@/components/beheer/materiaalTypes';
import messages from '../../../messages/nl.json';

const MATEN: Maat[] = [
  { id: 'maat-1', breedte: 40, hoogte: 60 },
  { id: 'maat-2', breedte: 60, hoogte: 90 },
];

function renderSection(overrides: Partial<React.ComponentProps<typeof MatenSection>> = {}) {
  const onAdd = vi.fn().mockResolvedValue(true);
  const onUpdate = vi.fn().mockResolvedValue(true);
  const onRemove = vi.fn().mockResolvedValue(true);
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <MatenSection maten={MATEN} loadError={null} onAdd={onAdd} onUpdate={onUpdate} onRemove={onRemove} {...overrides} />
    </NextIntlClientProvider>
  );
  return { onAdd, onUpdate, onRemove };
}

describe('MatenSection', () => {
  it('shows the load error instead of the table when loadError is set', () => {
    renderSection({ loadError: 'Kon niet laden.' });
    expect(screen.getByTestId('maten-error')).toHaveTextContent('Kon niet laden.');
  });

  it('renders nothing while maten is null and there is no error', () => {
    renderSection({ maten: null });
    expect(screen.queryByTestId('maten-section')).not.toBeInTheDocument();
  });

  it('lists the maten in the table', () => {
    renderSection();
    expect(screen.getByTestId('data-table-row-maat-1')).toHaveTextContent('40');
    expect(screen.getByTestId('data-table-row-maat-1')).toHaveTextContent('60');
  });

  it('adds a new maat', async () => {
    const { onAdd } = renderSection();
    fireEvent.click(screen.getByTestId('maten-add'));
    fireEvent.change(screen.getByTestId('maat-modal-breedte'), { target: { value: '80' } });
    fireEvent.change(screen.getByTestId('maat-modal-hoogte'), { target: { value: '120' } });
    fireEvent.click(screen.getByTestId('maat-modal-opslaan'));
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ breedte: 80, hoogte: 120 }));
  });

  it('disables Opslaan until both breedte and hoogte are filled in', () => {
    renderSection();
    fireEvent.click(screen.getByTestId('maten-add'));
    expect(screen.getByTestId('maat-modal-opslaan')).toBeDisabled();
    fireEvent.change(screen.getByTestId('maat-modal-breedte'), { target: { value: '80' } });
    expect(screen.getByTestId('maat-modal-opslaan')).toBeDisabled();
    fireEvent.change(screen.getByTestId('maat-modal-hoogte'), { target: { value: '120' } });
    expect(screen.getByTestId('maat-modal-opslaan')).not.toBeDisabled();
  });

  it('opens a row for editing pre-filled, and updates it', async () => {
    const { onUpdate } = renderSection();
    fireEvent.click(screen.getByTestId('data-table-row-maat-2'));
    expect(screen.getByTestId('maat-modal-breedte')).toHaveValue(60);
    expect(screen.getByTestId('maat-modal-hoogte')).toHaveValue(90);
    fireEvent.change(screen.getByTestId('maat-modal-hoogte'), { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('maat-modal-opslaan'));
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith('maat-2', { breedte: 60, hoogte: 100 }));
  });

  it('deletes a maat', async () => {
    const { onRemove } = renderSection();
    fireEvent.click(screen.getByTestId('data-table-row-maat-1'));
    fireEvent.click(screen.getByTestId('maat-modal-verwijderen'));
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith('maat-1'));
  });
});
