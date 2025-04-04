// eslint.config.cjs
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintPluginSimpleImportSort = require('eslint-plugin-simple-import-sort');
// Use the installed @typescript-eslint package for the ESLint plugin.
const tsEslint = require('@typescript-eslint/eslint-plugin');

module.exports = {
  ignores: ['dist', 'node_modules'],
  files: ['**/*.ts'],
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
    '@typescript-eslint/no-unused-vars': ['warn']
  }
};
