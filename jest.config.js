/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

const { resolve } = require('path')
const projectConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: process.cwd(),
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePathIgnorePatterns: ['dist'],
  clearMocks: true,
  moduleNameMapper: {
    '@klarna/nest-lambda-microservice/(.*)': resolve(__dirname, 'src/$1'),
    '@klarna/nest-lambda-microservice': resolve(__dirname, 'src'),
  },
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
