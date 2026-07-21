'use client';

import { useMemo, useState, type ReactNode } from 'react';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  filterType: 'text' | 'select';
  filterOptions?: string[];
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick: (row: T) => void;
  defaultFilters?: Record<string, string>;
  emptyLabel: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowId,
  onRowClick,
  defaultFilters,
  emptyLabel,
}: DataTableProps<T>) {
  const [filters, setFilters] = useState<Record<string, string>>(defaultFilters ?? {});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((column) => {
        const filterValue = filters[column.key];
        if (!filterValue) {
          return true;
        }
        const cellValue = String(row[column.key] ?? '');
        if (column.filterType === 'select') {
          return cellValue === filterValue;
        }
        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      })
    );
  }, [rows, columns, filters]);

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return filteredRows;
    }
    const sorted = [...filteredRows].sort((a, b) => {
      const aValue = a[sortKey as keyof T];
      const bValue = b[sortKey as keyof T];
      if (aValue === bValue) return 0;
      return (aValue as never) > (bValue as never) ? 1 : -1;
    });
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [filteredRows, sortKey, sortDirection]);

  function handleHeaderClick(column: Column<T>) {
    if (column.sortable === false) {
      return;
    }
    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortKey(null);
      setSortDirection(null);
    } else {
      setSortDirection('asc');
    }
  }

  return (
    <div data-testid="data-table" className="overflow-x-auto">
      <table className="w-full text-left text-sm text-white/80">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2">
                <button
                  type="button"
                  data-testid={`data-table-sort-${column.key}`}
                  onClick={() => handleHeaderClick(column)}
                  className="flex items-center gap-1 hover:text-white"
                >
                  {column.label}
                  {sortKey === column.key && (sortDirection === 'asc' ? ' ▲' : sortDirection === 'desc' ? ' ▼' : '')}
                </button>
              </th>
            ))}
          </tr>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2">
                {column.filterType === 'select' ? (
                  <select
                    value={filters[column.key] ?? ''}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, [column.key]: event.target.value }))
                    }
                    data-testid={`data-table-filter-${column.key}`}
                    className="w-full rounded-sm bg-black/40 px-2 py-1 text-xs text-white"
                  >
                    <option value="">—</option>
                    {(column.filterOptions ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={filters[column.key] ?? ''}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, [column.key]: event.target.value }))
                    }
                    data-testid={`data-table-filter-${column.key}`}
                    className="w-full rounded-sm bg-black/40 px-2 py-1 text-xs text-white"
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={getRowId(row)}
              data-testid={`data-table-row-${getRowId(row)}`}
              onClick={() => onRowClick(row)}
              className="cursor-pointer border-b border-white/5 hover:bg-white/5"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2">
                  {column.render ? column.render(row) : String(row[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedRows.length === 0 && (
        <p data-testid="data-table-empty" className="px-3 py-4 text-xs text-white/60">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
