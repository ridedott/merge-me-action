import { getInput } from '@actions/core';

import { logWarning } from './log';

export enum AllowedMergeMethods {
  MERGE = 'MERGE',
  SQUASH = 'SQUASH',
  REBASE = 'REBASE',
}

export enum AllowedMergePresets {
  DEPENDABOT_MINOR = 'DEPENDABOT_MINOR',
  DEPENDABOT_PATCH = 'DEPENDABOT_PATCH',
}

export const parseInputMergeMethod = (): AllowedMergeMethods => {
  const input = getInput('MERGE_METHOD');

  if (input.length === 0 || AllowedMergeMethods[input] === undefined) {
    logWarning(
      'MERGE_METHOD value input is ignored because it is malformed, defaulting to SQUASH.',
    );

    return AllowedMergeMethods.SQUASH;
  }

  return AllowedMergeMethods[input];
};

export const parseInputMergePreset = (): AllowedMergePresets | undefined => {
  const input = getInput('PRESET');

  if (input.length === 0) {
    return undefined;
  }

  if (AllowedMergePresets[input] === undefined) {
    logWarning('PRESET value input is ignored because it is malformed.');

    return undefined;
  }

  return AllowedMergePresets[input];
};
