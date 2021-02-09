/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-statements */

import { parseInputMergePreset } from './inputParsers';

export const checkPullRequestTitleForMergePreset = (title: string): boolean => {
  const category = parseInputMergePreset();

  if (category === undefined) {
    return true;
  }

  const semVerTitleRegExp = /bump .* from (?<from>.*) to (?<to>.*)/iu;
  const match = semVerTitleRegExp.exec(title);

  if (match === null) {
    return true;
  }

  const semVerRegExp = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/u;

  const matchGroups = match.groups;
  // Using non-null assertions per: https://github.com/microsoft/TypeScript/issues/32098
  const fromMatch = semVerRegExp.exec(matchGroups!.from!);
  const toMatch = semVerRegExp.exec(matchGroups!.to!);

  if (fromMatch === null || toMatch === null) {
    return true;
  }

  const fromMatchGroups = fromMatch.groups;
  const toMatchGroups = toMatch.groups;

  const fromMajor = fromMatchGroups!.major!;
  const toMajor = toMatchGroups!.major!;

  if (parseInt(fromMajor, 10) !== parseInt(toMajor, 10)) {
    return false;
  }

  const fromMinor = fromMatchGroups!.minor!;
  const toMinor = toMatchGroups!.minor!;

  if (parseInt(fromMinor, 10) !== parseInt(toMinor, 10)) {
    return category === 'DEPENDABOT_MINOR';
  }

  return true;
};
