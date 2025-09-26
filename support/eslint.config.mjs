import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * @type {import("typescript-eslint").ConfigArray}
 */
const config = tseslint.config(
  {
    ignores: ['**/coverage/', '**/tmp/'],
  },
  {
    //
    // base config
    //
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    //
    // non-typescript
    //
    files: ['**/*.{js,cjs,mjs}'],
    extends: [
      eslint.configs['recommended'], //
    ],
  },
  {
    //
    // typescript
    //
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslint.configs['recommended'],
      importPlugin.flatConfigs['recommended'],
      ...tseslint.configs['strict'],
      ...tseslint.configs['stylisticTypeChecked'],
    ],
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/require-await': 'error',
      'eqeqeq': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'no-param-reassign': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
);

export default config;
