/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  env: {
    node: true,
    jest: true,
  },
  plugins: ['@typescript-eslint', 'import'],
  ignorePatterns: ['dist/**/*'],
  rules: {
    'import/export': 0,
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        'newlines-between': 'always',
      },
    ],
  },
}
