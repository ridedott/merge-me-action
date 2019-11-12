module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    /*
     * Coverage of this file dropped significantly as the codebase is being
     * migrated to node-fetch.
     */
    'src/common/clients/axios.ts',
  ],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  preset: 'ts-jest',
  resetMocks: true,
  roots: ['<rootDir>/src'],
  testEnvironment: '<rootDir>/test/TestEnv.js',
};
