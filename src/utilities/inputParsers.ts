import { getInput } from '@actions/core';

import { logWarning } from './log';

export enum AllowedMergeMethods {
  MERGE = 'MERGE',
  SQUASH = 'SQUASH',
  REBASE = 'REBASE',
}

export enum AllowedMergeCategories {
  DEPENDABOT_MAJOR = 'DEPENDABOT_MAJOR',
  DEPENDABOT_MINOR = 'DEPENDABOT_MINOR',
  DEPENDABOT_PATCH = 'DEPENDABOT_PATCH',
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
  const input = getInput('PRESET');

  if (input.length === 0 || AllowedMergeCategories[input] === undefined) {
    logWarning(
      'PRESET value input is ignored because its malformed, defaulting to DEPENDABOT_MAJOR.',
    );

    return AllowedMergeCategories.DEPENDABOT_MAJOR;
  }

  return AllowedMergeCategories[input];
};
