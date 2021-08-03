/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-statements */

import { parseInputMergePreset } from './inputParsers';

export const checkPullRequestTitleForMergePreset = (title: string): boolean => {
  const category = parseInputMergePreset();

  if (category === undefined) {
    return true;
  }

  const semanticVersionTitleRegExp =
    /bump .* from (?<from>\S+) to (?<to>\S+)/iu;
  const match = semanticVersionTitleRegExp.exec(title);

  if (match === null) {
    return true;
  }

  const semVersionRegExp =
    /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/u;

  const matchGroups = match.groups;
  // Using non-null assertions per: https://github.com/microsoft/TypeScript/issues/32098
  const fromMatch = semVersionRegExp.exec(matchGroups!.from!);
  const toMatch = semVersionRegExp.exec(matchGroups!.to!);

  if (fromMatch === null || toMatch === null) {
    return true;
  }

  const fromMatchGroups = fromMatch.groups;
  const toMatchGroups = toMatch.groups;

  const fromMajor = fromMatchGroups!.major!;
  const toMajor = toMatchGroups!.major!;

  if (Number.parseInt(fromMajor, 10) !== Number.parseInt(toMajor, 10)) {
    return false;
  }

  const fromMinor = fromMatchGroups!.minor!;
  const toMinor = toMatchGroups!.minor!;

  if (Number.parseInt(fromMinor, 10) !== Number.parseInt(toMinor, 10)) {
    return category === 'DEPENDABOT_MINOR';
  }

  return true;
};
