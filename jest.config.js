module.exports = {
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  logHeapUsage: true,
  preset: 'ts-jest',
  resetMocks: true,
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testEnvironment: '<rootDir>/test/TestEnv.js',
};
