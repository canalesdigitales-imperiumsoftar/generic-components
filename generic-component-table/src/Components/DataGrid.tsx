import React, { useEffect, useState } from "react";

type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
};

type Action<T> = {
  label: string;
  onClick: (row: T) => void;
};

type Sort = {
  field: string;
  order: "ASC" | "DESC";
};

type CustomTableProps<T> = {
  columns: Column<T>[];
  fetchData: (params: {
    page: number;
    limit: number;
    sort: Sort;
    filter: Record<string, any>;
  }) => Promise<{ data: T[]; total: number }>;
  actions?: Action<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
};

export function CustomTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  onRowClick,
}: CustomTableProps<T>) {
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [sort, setSort] = useState<Sort>({ field: "id", order: "DESC" });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    // Aquí podrías agregar lógica para fetchData si es necesario
  }, [page, sort, filter]);

  return (
    <div className="p-4 bg-white shadow rounded-2xl">
      <input
        className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
        placeholder="Buscar..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table className="w-full table-auto text-sm text-gray-700">
        <thead className="text-left border-b-2 border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className="p-2 font-medium cursor-pointer"
                onClick={() =>
                  setSort({
                    field: String(col.accessor),
                    order: sort.order === "ASC" ? "DESC" : "ASC",
                  })
                }
              >
                {col.header} {sort.field === col.accessor && (sort.order === "ASC" ? "▲" : "▼")}
              </th>
            ))}
            {actions && <th className="p-2 font-medium">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 hover:bg-gray-50"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={String(col.accessor)} className="p-2">
                  {col.render && typeof col.render === 'function'
                    ? col.render(row[col.accessor], row)
                    : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {actions && (
                <td className="p-2 space-x-2">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => action.onClick(row)}
                      className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs"
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>
          Página {page}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.length / limit)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
