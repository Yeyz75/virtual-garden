import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()], // Habilita el plugin de Vue
  test: {
    globals: true, // Permite usar describe, it, expect, etc. sin importar
    environment: 'jsdom', // Simula el DOM para pruebas de componentes Vue
    setupFiles: [], // Puedes agregar archivos de setup aquí si necesitas inicialización global
    coverage: {
      reporter: ['text', 'html'], // Genera reporte de cobertura en texto y HTML
      exclude: ['node_modules/', 'dist/', 'tests/'], // Excluye estas carpetas de la cobertura
    },
  },
});
