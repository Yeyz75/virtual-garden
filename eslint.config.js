import { defineConfig } from 'eslint-8';
import vue from 'eslint-plugin-vue';
import ts from '@typescript-eslint/eslint-plugin';

export default defineConfig({
  root: true,
  env: { browser: true, node: true, es2021: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    // Prettier: fuerza el formato automático
    'prettier/prettier': 'error', // Marca como error cualquier cosa que no siga el formato de Prettier

    // Vue: buenas prácticas y legibilidad
    'vue/multi-word-component-names': 'off', // Permite nombres de componentes de una sola palabra
    'vue/no-v-html': 'warn', // Advierte sobre el uso de v-html (potencial XSS)
    'vue/require-default-prop': 'off', // No obliga a definir default en props opcionales

    // TypeScript: seguridad y claridad
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Advierte sobre variables no usadas, ignora las que empiezan con _
    '@typescript-eslint/explicit-module-boundary-types': 'off', // No obliga a tipar explícitamente los retornos de funciones públicas
    '@typescript-eslint/no-explicit-any': 'warn', // Advierte sobre el uso de any

    // JS/TS generales
    'no-console': 'warn', // Advierte sobre el uso de console.log
    'no-debugger': 'warn', // Advierte sobre el uso de debugger
    eqeqeq: ['error', 'always'], // Obliga a usar === y !== en vez de == y !=
    curly: 'error', // Obliga a usar llaves en bloques if/else/for/while
  },
});
