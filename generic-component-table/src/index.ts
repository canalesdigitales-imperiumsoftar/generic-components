// Importa el CSS principal para que Vite/Rollup lo procesen
import './lib.css'; 

// Exporta tus componentes
export { default as DataTable } from './Components/Table/DataTable';
export { default as ColumnFilter } from './Components/Table/ColumnFilters';
export { default as Pagination } from './Components/Table/Pagination';
export { default as SearchBar } from './Components/Table/SearchBar';
export { ButtonLoginWithGoogle } from './Components/ButtonGoogle';
export { default as DynamicFormModal } from './Components/DynamicFormModal';
export type { BaseEntity, Column, FilterConfig, SortConfig, PaginationInfo, DataTableProps } from './Components/Table/types';
// Puedes añadir más exports aquí