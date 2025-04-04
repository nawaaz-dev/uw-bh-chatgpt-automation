// eslint.config.cjs
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from '@typescript-eslint/eslint-plugin';
import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';

export default defineConfig({
  ignores: ['dist', 'node_modules'],
  files: ['**/*.ts'],
  languageOptions: {
   parser: tsParser,
  },
  plugins: {
    '@typescript-eslint': tsEslint,
    import: eslintPluginImport,
    'simple-import-sort': eslintPluginSimpleImportSort,
    prettier: eslintPluginPrettier
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/order': 'off',
    'prettier/prettier': 'warn',
    'no-unused-vars': 'off',
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { "argsIgnorePattern": "^_" }
    ]
  
  }
});

