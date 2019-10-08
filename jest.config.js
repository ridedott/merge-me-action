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
  coverageReporters: ['json', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 99,
      functions: 99,
      lines: 99,
      statements: 99,
    },
  },
  preset: 'ts-jest',
  resetMocks: true,
  roots: ['<rootDir>/src'],
  testEnvironment: '<rootDir>/test/TestEnv.js',
};
