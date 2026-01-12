import React from 'react';

interface ArrayFieldProps<T> {
  value: T[];
  onChange: (value: T[]) => void;
  renderItem: (item: T, index: number, updateItem: (index: number, field: keyof T, value: any) => void) => React.ReactNode;
  createEmptyItem: () => T;
  addButtonLabel?: string;
  disabled?: boolean;
}

export function ArrayField<T>({
  value = [],
  onChange,
  renderItem,
  createEmptyItem,
  addButtonLabel = '+ Agregar',
  disabled = false,
}: ArrayFieldProps<T>) {
  const addItem = () => {
    onChange([...value, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof T, val: any) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {value.map((item, idx) => (
        <div key={idx} className="p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
          {renderItem(item, idx, updateItem)}
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
            disabled={disabled}
          >
            ✕ Eliminar
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        disabled={disabled}
      >
        {addButtonLabel}
      </button>
    </div>
  );
}