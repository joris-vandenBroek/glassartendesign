import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, type Column } from '@/components/DataTable';

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
  { key: 'name', label: 'Naam', filterType: 'text' },
  { key: 'amount', label: 'Bedrag', filterType: 'text' },
  { key: 'status', label: 'Status', filterType: 'select', filterOptions: ['Open', 'Gesloten'] },
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

  it('filters rows via a text filter (case-insensitive substring match)', () => {
    renderTable();
    fireEvent.change(screen.getByTestId('data-table-filter-name'), { target: { value: 'lph' } });
    expect(screen.getByTestId('data-table-row-b')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-a')).not.toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-c')).not.toBeInTheDocument();
  });

  it('filters rows via a select filter (exact match)', () => {
    renderTable();
    fireEvent.change(screen.getByTestId('data-table-filter-status'), { target: { value: 'Gesloten' } });
    expect(screen.getByTestId('data-table-row-b')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-a')).not.toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-c')).not.toBeInTheDocument();
  });

  it('applies defaultFilters on first render', () => {
    renderTable({ defaultFilters: { status: 'Open' } });
    expect(screen.getByTestId('data-table-row-a')).toBeInTheDocument();
    expect(screen.getByTestId('data-table-row-c')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table-row-b')).not.toBeInTheDocument();
  });

  it('shows the emptyLabel when no rows match the current filters', () => {
    renderTable();
    fireEvent.change(screen.getByTestId('data-table-filter-name'), { target: { value: 'zzz' } });
    expect(screen.getByTestId('data-table-empty')).toHaveTextContent('Geen rijen gevonden.');
  });
});
