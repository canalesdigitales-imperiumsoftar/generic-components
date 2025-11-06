import React from 'react';

interface ColumnFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  columns: Array<{
    key: string;
    title: string;
    filterable?: boolean;
  }>;
}

const ColumnFilters: React.FC<ColumnFiltersProps> = ({
  filters,
  onFilterChange,
  columns
}) => {
  const filterableColumns = columns.filter(col => col.filterable);

  if (filterableColumns.length === 0) return null;

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filterableColumns.map(column => (
        <div key={column.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {column.title}
          </label>
          <input
            type="text"
            value={filters[column.key] || ''}
            onChange={(e) => onFilterChange(column.key, e.target.value)}
            placeholder={`Filtrar por ${column.title.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
};

export default ColumnFilters;