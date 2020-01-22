module.exports = {
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 65,
      lines: 65,
      statements: 65,
    },
  },
  preset: 'ts-jest',
  resetMocks: true,
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testEnvironment: '<rootDir>/test/TestEnv.js',
};
