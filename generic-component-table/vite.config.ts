import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Plugins útiles para librerías:
import dts from 'vite-plugin-dts'; // Genera archivos de tipos .d.ts
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'; // Inyecta CSS en el JS

export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true, include: ['src'],  }), // Asegura que los tipos se generen
    cssInjectedByJsPlugin(), // Inyecta el CSS automáticamente
  ],
  build: {
    // Usaremos el bundler Rollup por defecto (ninguna configuración extra necesaria aquí)
    lib: {
      entry: 'src/index.ts', // El punto de entrada principal de tu librería
      name: 'generic-component-table', // Nombre global para UMD/IIFE
      fileName: (format) => `generic-component-table.${format}.js`,
    },
    rollupOptions: {
      // Excluye React y React DOM del bundle final, ya que la app que use tu librería ya los tendrá
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: true, // Habilita la separación de CSS en archivos distintos
    assetsDir: '', // Genera assets directamente en dist/, no en dist/assets
  },
});