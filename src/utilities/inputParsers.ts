import { getInput } from '@actions/core';

import { logWarning } from './log';

export enum AllowedMergeMethods {
  MERGE = 'MERGE',
  SQUASH = 'SQUASH',
  REBASE = 'REBASE',
}

export enum AllowedMergeCategories {
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  PATCH = 'PATCH',
  ANY = 'ANY'
}

export const parseInputMergeMethod = (): AllowedMergeMethods => {
  const input = getInput('MERGE_METHOD');

  if (input.length === 0 || AllowedMergeMethods[input] === undefined) {
    logWarning(
      'MERGE_METHOD value input is ignored because its malformed, defaulting to SQUASH.',
    );

    return AllowedMergeMethods.SQUASH;
  }

  return AllowedMergeMethods[input];
};

export const parseInputMergeCategory = (): AllowedMergeCategories => {
  const input = getInput('MERGE_CATEGORY');

  if (input.length === 0 || AllowedMergeCategories[input] === undefined) {
    logWarning(
      'MERGE_CATEGORY value input is ignored because its malformed, defaulting to ANY.',
    );

    return AllowedMergeCategories.ANY;
  }

  return AllowedMergeCategories[input];
};

