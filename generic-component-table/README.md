# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# Generic Component Table

Una librería moderna de componentes React para tablas de datos con soporte completo para filtrado, ordenamiento, paginación y formularios dinámicos.

[![npm version](https://img.shields.io/npm/v/generic-component-table.svg)](https://www.npmjs.com/package/generic-component-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Instalación

```bash
npm install generic-component-table
# o
yarn add generic-component-table
# o
pnpm add generic-component-table
```

## 🚀 Características

- ✅ **DataTable con filtrado server-side**: Filtros inteligentes con soporte para texto y select
- ✅ **Ordenamiento bidireccional**: Click en columnas para ordenar ASC/DESC
- ✅ **Paginación integrada**: Control completo de navegación entre páginas
- ✅ **Selección múltiple**: Checkbox por fila con selección masiva
- ✅ **DynamicFormModal**: Formularios generados dinámicamente desde configuración
- ✅ **Tema claro/oscuro**: Adaptable automáticamente
- ✅ **TypeScript**: Tipado completo para mejor DX
- ✅ **Acciones CRUD**: Botones de Ver, Editar y Eliminar personalizables
- ✅ **Exportar/Imprimir**: Funciones integradas para exportar datos

## 📖 Uso Básico

### DataTable

```tsx
import { DataTable } from 'generic-component-table';

interface Product {
  id: string;
  name: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const columns = [
  { 
    key: 'name', 
    title: 'Nombre', 
    sortable: true, 
    filterable: true,
    filterType: 'text'
  },
  { 
    key: 'price', 
    title: 'Precio', 
    sortable: true 
  },
  {
    key: 'status',
    title: 'Estado',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'ACTIVE', label: 'Activo' },
      { value: 'INACTIVE', label: 'Inactivo' }
    ],
    render: (val: string) => (
      <span className={val === 'ACTIVE' ? 'badge-green' : 'badge-red'}>
        {val}
      </span>
    )
  }
];

function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleFilter = (payload: any) => {
    if (payload.__action === 'searchCommit') {
      // Aplicar búsqueda global
      fetchProducts({ q: payload.q, page: 1 });
    }
    if (payload.__action === 'field') {
      // Aplicar filtro específico de columna
      fetchProducts({ ...payload.filters, page: 1 });
    }
    if (payload.__action === 'sort') {
      // Aplicar ordenamiento
      fetchProducts({ 
        sort: payload.sort.field, 
        order: payload.sort.order 
      });
    }
  };

  return (
    <DataTable<Product>
      data={products}
      columns={columns}
      loading={false}
      selectable
      onCreate={() => console.log('Crear')}
      onEdit={(row) => console.log('Editar', row)}
      onDelete={(row) => console.log('Eliminar', row)}
      onView={(row) => console.log('Ver', row)}
      filterMode="server"
      onFilter={handleFilter}
      pagination={{
        currentPage: page,
        totalPages: Math.ceil(total / 10),
        totalItems: total,
        itemsPerPage: 10
      }}
      onPageChange={setPage}
      showSearch
      showFilters
      rowKey="id"
    />
  );
}
```

### DynamicFormModal

```tsx
import { DynamicFormModal } from 'generic-component-table';

const fields = [
  { 
    name: 'name', 
    label: 'Nombre del Producto', 
    type: 'text', 
    required: true 
  },
  { 
    name: 'description', 
    label: 'Descripción', 
    type: 'textarea' 
  },
  { 
    name: 'price', 
    label: 'Precio', 
    type: 'number', 
    required: true 
  },
  {
    name: 'category',
    label: 'Categoría',
    type: 'select',
    options: [
      { value: '1', label: 'Electrónica' },
      { value: '2', label: 'Ropa' }
    ],
    required: true
  }
];

function ProductForm() {
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] = useState({});

  const handleSubmit = async (data: any) => {
    console.log('Datos del formulario:', data);
    // Enviar al backend
    await saveProduct(data);
    setOpen(false);
  };

  return (
    <DynamicFormModal
      open={open}
      onClose={() => setOpen(false)}
      defaultValues={initialData}
      fields={fields}
      title="Nuevo Producto"
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
```

## 🔧 API Reference

### DataTable Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Array de datos a mostrar |
| `columns` | `Column<T>[]` | `[]` | Configuración de columnas |
| `loading` | `boolean` | `false` | Estado de carga |
| `selectable` | `boolean` | `false` | Habilita selección múltiple |
| `selectedRows` | `T[]` | `[]` | Filas seleccionadas |
| `onSelectionChange` | `(rows: T[]) => void` | - | Callback al cambiar selección |
| `onCreate` | `() => void` | - | Callback botón "Crear" |
| `onEdit` | `(row: T) => void` | - | Callback botón "Editar" |
| `onDelete` | `(row: T) => void` | - | Callback botón "Eliminar" |
| `onView` | `(row: T) => void` | - | Callback botón "Ver" |
| `onExport` | `() => void` | - | Callback exportar datos |
| `onPrint` | `() => void` | - | Callback imprimir |
| `filterMode` | `'client' \| 'server'` | `'client'` | Modo de filtrado |
| `onFilter` | `(payload: any) => void` | - | Callback al aplicar filtros |
| `externalFilters` | `Record<string, string>` | `{}` | Filtros externos (rehidratación) |
| `pagination` | `PaginationConfig` | - | Configuración de paginación |
| `onPageChange` | `(page: number) => void` | - | Callback cambio de página |
| `theme` | `'light' \| 'dark'` | `'light'` | Tema visual |
| `showSearch` | `boolean` | `true` | Mostrar barra de búsqueda |
| `showFilters` | `boolean` | `false` | Mostrar panel de filtros |
| `emptyMessage` | `string` | `'No hay datos'` | Mensaje cuando no hay datos |
| `rowKey` | `keyof T \| ((row: T) => string)` | `'id'` | Clave única por fila |

### Column Config

```typescript
interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
}
```

### DynamicFormModal Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `open` | `boolean` | Estado de apertura del modal |
| `onClose` | `() => void` | Callback al cerrar |
| `defaultValues` | `Record<string, any>` | Valores iniciales del formulario |
| `fields` | `Field[]` | Configuración de campos |
| `title` | `string` | Título del modal |
| `onSubmit` | `(data: any) => void \| Promise<void>` | Callback al enviar |
| `isLoading` | `boolean` | Estado de carga del submit |

### Field Config

```typescript
interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox';
  options?: { value: string; label: string }[]; // Para type='select'
  required?: boolean;
  placeholder?: string;
}
```

## 🎨 Personalización de Estilos

La librería usa Tailwind CSS. Asegúrate de tener configurado Tailwind en tu proyecto:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/generic-component-table/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 📚 Ejemplos Avanzados

### Filtrado Server-Side con React Router

```tsx
import { useSearchParams } from 'react-router-dom';
import { DataTable } from 'generic-component-table';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parsear filtros desde URL
  const filters = Object.fromEntries(searchParams.entries());
  const page = Number(searchParams.get('page') || 1);

  const handleFilter = (payload: any) => {
    const params = new URLSearchParams();
    
    if (payload.__action === 'searchCommit') {
      if (payload.q) params.set('q', payload.q);
    }
    
    if (payload.__action === 'field') {
      Object.entries(payload.filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
    }
    
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <DataTable
      data={products}
      columns={columns}
      filterMode="server"
      onFilter={handleFilter}
      externalFilters={filters} // Rehidrata inputs desde URL
      pagination={{ currentPage: page, ... }}
    />
  );
}
```

### Integración con React Admin

```tsx
import { useGetList } from 'react-admin';
import { DataTable } from 'generic-component-table';

function useProductData() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ field: 'id', order: 'DESC' });

  const { data, total, isLoading } = useGetList('products', {
    pagination: { page, perPage: 10 },
    sort,
    filter: filters
  });

  const handleFilter = (payload: any) => {
    if (payload.__action === 'searchCommit') {
      setFilters(prev => ({ ...prev, q: payload.q }));
      setPage(1);
    }
    if (payload.__action === 'sort') {
      setSort({ 
        field: payload.sort.field, 
        order: payload.sort.order 
      });
    }
  };

  return { data, total, isLoading, handleFilter, page, setPage };
}
```

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Publicar
npm publish
```

## 📝 Licencia

MIT © [ImperiumSoft]

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Para reportar bugs o solicitar features, abre un issue en [GitHub](https://github.com/tu-usuario/generic-component-table/issues).

---

**Hecho con ❤️ por ImperiumSoft**
