import javascriptEslint from '@eslint/js'
import pluginJest from 'eslint-plugin-jest'
import pluginNode from 'eslint-plugin-n'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import typescriptEslint from 'typescript-eslint'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  javascriptEslint.configs.recommended,
  ...typescriptEslint.configs.recommended,

  {
    ignores: ['**/node_modules', '**/dist', '**/coverage'],
  },

  {
    settings: {
      jest: {
        version: 29,
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },

  /* Import sorting */
  {
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  /* Source files */
  {
    files: ['src/**/*.ts', 'examples/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrors: 'none',
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': ['warn'],
    },
  },

  /* Mock files */
  {
    files: ['src/**/__mocks__/**', 'src/**/__mocks__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': ['off'],
    },
  },

  /* Test files */
  {
    files: ['test/**/*.ts', 'src/**/__tests__/**', 'src/**/*.spec.ts'],
    ...pluginJest.configs['flat/recommended'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrors: 'none',
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': ['warn'],
    },
  },

  /* Node files */
  {
    files: ['**/*.mjs'],
    ...pluginNode.configs['flat/recommended-script'],
  },
]
