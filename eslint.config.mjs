import { jest } from '@ridedott/eslint-config';

export default [
  ...jest,
  {
    files: ['src/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'jest/require-hook': 'error',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-magic-numbers': 'off',
    },
  },
  {
    files: ['src/**/computeRequiresStrictStatusChecksForRefs.*'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    rules: {
      'jest/require-hook': 'off',
      'no-negated-condition': 'off',
    },
  },
];
