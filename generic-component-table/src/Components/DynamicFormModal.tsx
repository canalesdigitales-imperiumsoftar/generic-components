import React, { useState, useEffect } from 'react';

interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface DynamicFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

export const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  open,
  onClose,
  title,
  fields,
  defaultValues = {},
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Inicializar form data cuando cambian los defaultValues
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      console.log('🔄 Setting form default values:', defaultValues);
      setFormData(defaultValues);
    } else {
      // Reset form para nuevo registro
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
    }
  }, [defaultValues, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar solo campos requeridos
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const fieldValue = formData[field.name];
      
      // Solo validar si el campo es requerido
      if (field.required === true) {
        if (!fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined) {
          newErrors[field.name] = `${field.label} es requerido`;
        }
      }
      
      // Validación especial para URLs si tiene valor
      if (field.type === 'url' && fieldValue && fieldValue.trim() !== '') {
        try {
          new URL(fieldValue);
        } catch {
          newErrors[field.name] = 'Debe ser una URL válida';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Limpiar campos vacíos opcionales antes de enviar
      const cleanFormData = { ...formData };
      fields.forEach(field => {
        if (!field.required && (!cleanFormData[field.name] || cleanFormData[field.name] === '')) {
          cleanFormData[field.name] = field.type === 'url' ? '' : cleanFormData[field.name];
        }
      });

      console.log('📤 Submitting clean form data:', cleanFormData);
      await onSubmit(cleanFormData);
    } catch (error) {
      console.error('❌ Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const hasError = errors[field.name];

    console.log(`🔍 Rendering field ${field.name}:`, { 
      type: field.type, 
      value, 
      options: field.options 
    });

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} min-h-[80px] resize-vertical`}
            disabled={submitting}
            rows={3}
          />
        );

      case 'select':
        console.log(`🔽 Select field ${field.name} options:`, field.options);
        return (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClasses}
            disabled={submitting}
          >
            <option value="">Seleccionar {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseClasses}
            disabled={submitting}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Ingresa ${field.label.toLowerCase()}`}
            className={baseClasses}
            disabled={submitting}
          />
        );

      default:
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            disabled={submitting}
          />
        );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
            disabled={submitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(field => (
                <div key={field.name} className="space-y-1">
                  <label 
                    htmlFor={field.name} 
                    className="block text-sm font-medium text-gray-700"
                  >
                    {field.label}
                    {field.required === true && <span className="text-red-500 ml-1">*</span>}
                    {field.required === false && <span className="text-gray-400 ml-1">(Opcional)</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs">{errors[field.name]}</p>
                  )}
                </div>
              ))}
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={submitting || isLoading}
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicFormModal;