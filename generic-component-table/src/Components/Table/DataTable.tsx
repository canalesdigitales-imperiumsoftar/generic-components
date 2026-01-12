import { useState, useMemo, useEffect, useRef } from 'react';
import type { DataTableProps, BaseEntity } from './types';

const DataTable = <T extends BaseEntity>({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
  onPrint,
  onFilter,
  pagination,
  onPageChange,
  theme = 'light',
  showSearch = true,
  showFilters = false,
  emptyMessage = 'No hay datos disponibles',
  rowKey = 'id',
  className = '',
  filterMode = 'server',
  externalFilters = {}
}: DataTableProps<T>) => {
  const [searchDraft, setSearchDraft] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(externalFilters);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Usar JSON.stringify para comparar contenido de externalFilters, no referencia
  const externalFiltersString = JSON.stringify(externalFilters);
  
  useEffect(() => {
    setFilters(externalFilters);
    setSearchDraft(externalFilters.q || '');
  }, [externalFiltersString]);
  
  const getRowKey = (record: T): string | number => {
    if (typeof rowKey === 'function') return rowKey(record);
    return record[rowKey] as string | number;
  };

  const processedData = useMemo(() => {
    if (filterMode === 'server') return data;
    // Client mode (opcional)
    let filtered = [...data];
    if (filters.q) {
      filtered = filtered.filter(item =>
        Object.values(item).some(v =>
          String(v).toLowerCase().includes(String(filters.q).toLowerCase())
        )
      );
    }
    Object.entries(filters).forEach(([k, v]) => {
      if (!v || k === 'q') return;
      filtered = filtered.filter(item =>
        String(item[k as keyof T] ?? '').toLowerCase().includes(String(v).toLowerCase())
      );
    });
    if (sortConfig) {
      filtered.sort((a, b) => {
        const av: any = a[sortConfig.key as keyof T];
        const bv: any = b[sortConfig.key as keyof T];
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, filters, sortConfig, filterMode]);

  const handleSort = (key: string) => {
    setSortConfig(cur => {
      const next = cur?.key === key
        ? { key, direction: cur.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' };
      if (filterMode === 'server') {
        onFilter?.({
          __action: 'sort',
          sort: { field: key, order: next.direction.toUpperCase() }
        });
      }
      return next;
    });
  };

  const commitFieldFilter = (key: string, value: string) => {
    setFilters(prev => {
      const nf = { ...prev, [key]: value };
      if (filterMode === 'server') {
        onFilter?.({
          __action: 'field',
          filters: { [key]: value }
        });
      }
      return nf;
    });
  };

  const commitSearch = () => {
    setFilters(prev => {
      const nf = { ...prev, q: searchDraft };
      if (filterMode === 'server') {
        onFilter?.({ __action: 'searchCommit', q: searchDraft });
      } else {
        // client
        onFilter?.(nf);
      }
      return nf;
    });
  };

  const handleRowSelection = (record: T, selected: boolean) => {
    if (!onSelectionChange) return;
    const key = getRowKey(record);
    const next = selected
      ? [...selectedRows, record]
      : selectedRows.filter(r => getRowKey(r) !== key);
    onSelectionChange(next);
  };

  const isRowSelected = (record: T) =>
    selectedRows.some(r => getRowKey(r) === getRowKey(record));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} ${className} p-6 rounded-2xl shadow-sm border border-gray-200`}>
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          {onCreate && (
            <button onClick={onCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Crear
            </button>
          )}
          {onExport && (
            <button onClick={onExport} className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
              Exportar
            </button>
          )}
          {onPrint && (
            <button onClick={onPrint} className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
              Imprimir
            </button>
          )}
        </div>

        {showSearch && (
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder={filterMode === 'server' ? 'Buscar (Enter para aplicar)...' : 'Buscar...'}
              value={searchDraft}
              onChange={e => setSearchDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitSearch();
              }}
              className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros</h4>
            <div className="flex flex-wrap gap-4">
              {columns.filter(c => c.filterable).map(col => {
                const key = String(col.key);
                const value = filters[key] ?? '';
                if (col.filterType === 'select' && col.filterOptions) {
                  return (
                    <div key={key} className="flex-1 min-w-44">
                      <label className="block text-xs font-medium mb-1 text-gray-600">{col.title}</label>
                      <select
                        value={value}
                        onChange={e => {
                          const v = e.target.value;
                          setFilters(prev => ({ ...prev, [key]: v }));
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitFieldFilter(key, (e.target as HTMLSelectElement).value);
                        }}
                        onBlur={() => {
                          // opcional: no auto-commit; solo Enter
                        }}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="">-- Todos --</option>
                        {col.filterOptions.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <div key={key} className="flex-1 min-w-44">
                    <label className="block text-xs font-medium mb-1 text-gray-600">{col.title}</label>
                    <input
                      type="text"
                      value={value}
                      placeholder={`Filtrar ${col.title}`}
                      onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitFieldFilter(key, (e.target as HTMLInputElement).value);
                      }}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                );
              })}
            </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length > 0 && selectedRows.length === processedData.length}
                    onChange={e => onSelectionChange?.(e.target.checked ? processedData : [])}
                  />
                </th>
              )}
              {columns.map(c => (
                <th
                  key={String(c.key)}
                  onClick={() => c.sortable && handleSort(String(c.key))}
                  className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${
                    c.sortable ? 'cursor-pointer' : ''
                  } ${c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {c.title}
                </th>
              ))}
              <th className="px-6 py-3 text-xs font-semibold uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 2 : 1)}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {processedData.map((row, idx) => {
              const selected = isRowSelected(row);
              return (
                <tr key={getRowKey(row)} className={selected ? 'bg-blue-50' : ''}>
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={e => handleRowSelection(row, e.target.checked)}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className={`px-6 py-3 text-sm ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {col.render
                        ? col.render(row[col.key as keyof T], row, idx)
                        : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                  <td className="px-6 py-3">
                    <div className="flex gap-2 justify-center">
                      {onView && (
                        <button 
                          onClick={() => onView(row)} 
                          className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition"
                        >
                            Ver
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(row)} 
                          className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-medium transition"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(row)} 
                          className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex justify-between items-center text-sm">
          <span>
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;