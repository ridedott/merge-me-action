import { getInput } from '@actions/core';

import { logWarning } from './log';

export enum AllowedMergeMethods {
  MERGE = 'MERGE',
  SQUASH = 'SQUASH',
  REBASE = 'REBASE',
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
