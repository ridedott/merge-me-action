import { getInput } from '@actions/core';

export enum AllowedMergeMethods {
  MERGE = 'MERGE',
  SQUASH = 'SQUASH',
  REBASE = 'REBASE',
}

export const parseInputMergeMethod = (): AllowedMergeMethods => {
  const input = getInput('MERGE_METHOD');

  if (input.length === 0 || AllowedMergeMethods[input] === undefined) {
    return AllowedMergeMethods.SQUASH;
  }

  return AllowedMergeMethods[input];
};
