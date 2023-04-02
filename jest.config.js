/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

const projectConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: process.cwd(),
  moduleNameMapper: {},
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePathIgnorePatterns: ['dist'],
  clearMocks: true,
}

module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['json', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/dist/.*'],
  watchman: true,
  projects: [
    {
      displayName: {
        name: 'unit',
        color: 'red',
      },
      testMatch: ['<rootDir>/src/**/*.(test|spec).ts', '<rootDir>/src/**/__tests__/**/*.ts'],
      ...projectConfig,
    },
    {
      displayName: {
        name: 'integration',
        color: 'blue',
      },
      testMatch: ['<rootDir>/test/**/*.(test|spec).ts'],
      ...projectConfig,
    },
  ],
}
