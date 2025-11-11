import type { ReactNode } from 'react';

// Base entity interface
export interface BaseEntity {
  id: string | number;
}

// Column configuration
export interface Column<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record?: T, index?: number) => ReactNode;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  fixed?: 'left' | 'right';
}

// Filter configuration
export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

// Sort configuration
export interface SortConfig {
  field: string;
  order: 'ASC' | 'DESC' | 'asc' | 'desc';
}

// Pagination info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// DataTable props
export interface DataTableProps<T extends BaseEntity> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  onCreate?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  onExport?: () => void;
  onPrint?: () => void;
  onFilter?: (filters: Record<string, any>) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  theme?: 'light' | 'dark';
  showSearch?: boolean;
  showFilters?: boolean;
  emptyMessage?: string;
  rowKey?: keyof T | ((record: T) => string | number);
  className?: string;
  filters?: Record<string, string>;
  filterMode?: 'client' | 'server';
  externalFilters?: Record<string, string>; // 👈 para rehidratar
}