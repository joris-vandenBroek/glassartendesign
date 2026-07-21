import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, type Column, type StatusQuickFilter } from '@/components/DataTable';

interface Row {
  id: string;
  name: string;
  amount: number;
  status: string;
}

const ROWS: Row[] = [
  { id: 'a', name: 'Bravo', amount: 20, status: 'Open' },
  { id: 'b', name: 'Alpha', amount: 5, status: 'Gesloten' },
  { id: 'c', name: 'Charlie', amount: 10, status: 'Open' },
];

const COLUMNS: Column<Row>[] = [
  { key: 'name', label: 'Naam' },
  { key: 'amount', label: 'Bedrag' },
  { key: 'status', label: 'Status' },
];

function renderTable(overrides: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
  const onRowClick = vi.fn();
  render(
    <DataTable
      columns={COLUMNS}
      rows={ROWS}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyLabel="Geen rijen gevonden."
      searchPlaceholder="Zoeken..."
      {...overrides}
    />
  );
  return { onRowClick };
}

describe('DataTable', () => {
  it('renders every row and every column header', () => {
    renderTable();
    expect(screen.getByTestId('data-table-row-a')).toHaveTextContent('Bravo');
    expect(screen.getByTestId('data-table-row-b')).toHaveTextContent('Alpha');
    expect(screen.getByTestId('data-table-row-c')).toHaveTextContent('Charlie');
    expect(screen.getByTestId('data-table-sort-name')).toHaveTextContent('Naam');
  });

  it('calls onRowClick with the full row when a row is clicked', () => {
    const { onRowClick } = renderTable();
    fireEvent.click(screen.getByTestId('data-table-row-b'));
    expect(onRowClick).toHaveBeenCalledWith(ROWS[1]);
  });

  it('sorts a column ascending, then descending, then back to unsorted on repeated header clicks', () => {
    renderTable();
    const header = screen.getByTestId('data-table-sort-name');
    const rowOrder = () => screen.getAllByTestId(/^data-table-row-/).map((row) => row.textContent);

    fireEvent.click(header);
    expect(rowOrder()[0]).toContain('Alpha');

    fireEvent.click(header);
    expect(rowOrder()[0]).toContain('Charlie');

    fireEvent.click(header);
    expect(rowOrder()[0]).toContain('Bravo');
  });

  it('sorts a numeric column numerically, not lexicographically', () => {
    renderTable();
    fireEvent.click(screen.getByTestId('data-table-sort-amount'));
    const rowOrder = () => screen.getAllByTestId(/^data-table-row-/).map((row) => row.getAttribute('data-testid'));
    expect(rowOrder()).toEqual(['data-table-row-b', 'data-table-row-c', 'data-table-row-a']);
  });

  it('filters rows via the global search across every column (case-insensitive substring match)', () => {
    renderTable();
    fireEvent.change(screen.getByTestId('data-table-search'), { target: { value: 'lph' } });
    expect(screen.getByTestId('data-table-row-b')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-a')).not.toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-c')).not.toBeInTheDocument();
  });

  it('matches the global search against a column not visible in the current sort, e.g. status', () => {
    renderTable();
    fireEvent.change(screen.getByTestId('data-table-search'), { target: { value: 'Gesloten' } });
    expect(screen.getByTestId('data-table-row-b')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-a')).not.toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-c')).not.toBeInTheDocument();
  });

  it('shows the emptyLabel when no rows match the current search', () => {
    renderTable();
    fireEvent.change(screen.getByTestId('data-table-search'), { target: { value: 'zzz' } });
    expect(screen.getByTestId('data-table-empty')).toHaveTextContent('Geen rijen gevonden.');
  });

  describe('quickFilter', () => {
    const quickFilter: StatusQuickFilter<Row> = {
      key: 'status',
      activeValue: 'Open',
      activeLabel: 'Open rijen',
      allLabel: 'Alle rijen',
    };

    it('applies the quick filter to only the activeValue by default', () => {
      renderTable({ quickFilter });
      expect(screen.getByTestId('data-table-row-a')).toBeInTheDocument();
      expect(screen.getByTestId('data-table-row-c')).toBeInTheDocument();
      expect(screen.queryByTestId('data-table-row-b')).not.toBeInTheDocument();
    });

    it('shows all rows after clicking the "all" quick filter link', () => {
      renderTable({ quickFilter });
      fireEvent.click(screen.getByTestId('data-table-quick-all'));
      expect(screen.getByTestId('data-table-row-a')).toBeInTheDocument();
      expect(screen.getByTestId('data-table-row-b')).toBeInTheDocument();
      expect(screen.getByTestId('data-table-row-c')).toBeInTheDocument();
    });

    it('combines the quick filter with the global search', () => {
      renderTable({ quickFilter });
      fireEvent.change(screen.getByTestId('data-table-search'), { target: { value: 'Bravo' } });
      expect(screen.getByTestId('data-table-row-a')).toBeInTheDocument();
      expect(screen.queryByTestId('data-table-row-c')).not.toBeInTheDocument();
    });

    it('does not render quick filter links when no quickFilter is passed', () => {
      renderTable();
      expect(screen.queryByTestId('data-table-quick-active')).not.toBeInTheDocument();
      expect(screen.queryByTestId('data-table-quick-all')).not.toBeInTheDocument();
    });
  });
});
