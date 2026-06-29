import { jest } from '@ridedott/eslint-config';

export default [
  { ignores: ['dist/**', 'lib/**', '**/*.js', '**/*.cjs', '**/*.mjs'] },
  ...jest,
  {
    rules: {
      // Rules newly enabled by @ridedott/eslint-config v5 (newer
      // typescript-eslint / unicorn defaults) that flag pre-existing code.
      // Disabled to keep this strictly a config + runtime upgrade with no
      // source changes; re-enabling and auto-fixing is tracked as follow-up.
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/consistent-return': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      'unicorn/no-await-in-promise-methods': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-useless-promise-resolve-reject': 'off',
      'unicorn/prefer-global-this': 'off',
    },
  },
  {
    // This file's name and identifiers use the "Refs" abbreviation by design.
    files: ['src/**/computeRequiresStrictStatusChecksForRefs.*'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: ['src/**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'jest/prefer-ending-with-an-expect': 'off',
      'jest/prefer-importing-jest-globals': 'off',
      'jest/require-hook': 'off',
      'jest/require-top-level-describe': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-magic-numbers': 'off',
    },
  },
  {
    rules: {
      'no-negated-condition': 'off',
    },
  },
];
