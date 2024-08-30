/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    settings: {
      jest: {
        version: 29,
      },
    },
    ignores: ['**/node_modules', '**/dist', '**/coverage', '.*'],
    rules: {
      // 'import/no-duplicates': ['error', { considerQueryString: true }],
      // 'import/export': 0,
      // 'import/order': [
      //   'error',
      //   {
      //     groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
      //     'newlines-between': 'always',
      //   },
      // ],
      // 'no-unused-vars': [
      //   'warn',
      //   {
      //     argsIgnorePattern: '^_',
      //     destructuredArrayIgnorePattern: '^_',
      //     caughtErrors: 'none',
      //     args: 'none',
      //   },
      // ],
      // '@typescript-eslint/no-unused-expressions': ['warn'],
    },
  },
]

// module.exports = {
//   extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     ecmaVersion: 12,
//     sourceType: 'module',
//   },
//   env: {
//     node: true,
//     jest: true,
//   },
//   plugins: ['@typescript-eslint', 'import'],
//   ignorePatterns: ['dist/**/*'],
//   // rules: {
//   //   'import/no-duplicates': ['error', { considerQueryString: true }],
//   //   'import/export': 0,
//   //   'import/order': [
//   //     'error',
//   //     {
//   //       groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
//   //       'newlines-between': 'always',
//   //     },
//   //   ],
//   // },
// }
