/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: process.cwd(),
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '__mocks__/index.ts'],
  testPathIgnorePatterns: ['<rootDir>/dist/.*', '<rootDir>/dist/package.json'],
  clearMocks: true,
  moduleNameMapper: {
    '@klarna/nest-lambda-microservice/(.*)': resolve(__dirname, 'src/$1'),
    '@klarna/nest-lambda-microservice': resolve(__dirname, 'src'),
  },
}

export default {
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
