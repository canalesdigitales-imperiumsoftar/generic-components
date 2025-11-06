import { useState, useMemo } from 'react';
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
  className = ''
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Iconos para los botones de acción
  const ViewIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

  const ExportIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const PrintIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  // Obtener la clave de fila
  const getRowKey = (record: T): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] as string | number;
  };

  // Filtrar y ordenar datos
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item =>
          String(item[key as keyof T]).toLowerCase().includes(String(value).toLowerCase())
        );
      }
    });

    // Aplicar ordenamiento
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortConfig]);

  // Manejar ordenamiento
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Manejar selección
  const handleRowSelection = (record: T, selected: boolean) => {
    if (!onSelectionChange) return;

    const recordKey = getRowKey(record);
    let newSelection: T[];

    if (selected) {
      newSelection = [...selectedRows, record];
    } else {
      newSelection = selectedRows.filter(item => getRowKey(item) !== recordKey);
    }

    onSelectionChange(newSelection);
  };

  // Verificar si una fila está seleccionada
  const isRowSelected = (record: T): boolean => {
    const recordKey = getRowKey(record);
    return selectedRows.some(item => getRowKey(item) === recordKey);
  };

  // Manejar filtros
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} ${className} p-6 rounded-2xl shadow-sm border border-gray-200`}>
      {/* Header con acciones mejorado */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          {onCreate && (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Crear</span>
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg"
            >
              <ExportIcon />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}
          {onPrint && (
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
            >
              <PrintIcon />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          )}
        </div>

        {/* Búsqueda mejorada */}
        {showSearch && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Buscar en todos los campos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Filtros mejorados */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros avanzados</h4>
          <div className="flex flex-wrap gap-4">
            {columns.filter(col => col.filterable).map(column => (
              <div key={String(column.key)} className="flex-1 min-w-48">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {column.title}
                </label>
                <input
                  type="text"
                  placeholder={`Filtrar por ${column.title}`}
                  value={filters[String(column.key)] || ''}
                  onChange={(e) => handleFilterChange(String(column.key), e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla mejorada */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              {selectable && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === processedData.length && processedData.length > 0}
                    onChange={(e) => {
                      if (onSelectionChange) {
                        onSelectionChange(e.target.checked ? processedData : []);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                  } ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <span className="text-gray-400 text-sm">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl text-gray-300">📭</div>
                    <div className="text-lg font-medium">{emptyMessage}</div>
                    <div className="text-sm text-gray-400">No se encontraron registros que coincidan con tu búsqueda</div>
                  </div>
                </td>
              </tr>
            ) : (
              processedData.map((record, index) => {
                const isSelected = isRowSelected(record);
                return (
                  <tr
                    key={getRowKey(record)}
                    className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelection(record, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}
                      >
                        {column.render
                          ? column.render(record[column.key as keyof T], record, index)
                          : String(record[column.key as keyof T] || '')
                        }
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(record);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 focus:ring-blue-500"
                            title="Ver detalles"
                          >
                            <ViewIcon />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(record);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 focus:ring-indigo-500"
                            title="Editar registro"
                          >
                            <EditIcon />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(record);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 focus:ring-red-500"
                            title="Eliminar registro"
                          >
                            <DeleteIcon />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación mejorada */}
      {pagination && (
        <div className="mt-6 flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}</span> a{' '}
            <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> de{' '}
            <span className="font-medium">{pagination.totalItems}</span> resultados
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                {pagination.currentPage}
              </span>
              <span className="text-sm text-gray-500">de {pagination.totalPages}</span>
            </div>

            <button
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;