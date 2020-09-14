export const checkPullRequestTitleForMergeCategory = (
  title: string,
  category: string,
): boolean => {
  if (category === 'MAJOR') {
    return true;
  }

  const semVerTitleRegExp = /bump .* from (?<from>.*) to (?<to>.*)/u;
  const match = semVerTitleRegExp.exec(title);

  if (match === null) {
    return true;
  }

  const semVerRegExp = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/u;

  const matchGroups = match.groups;
  const from = matchGroups?.from;
  const to = matchGroups?.to;

  if (from === undefined || to === undefined) {
    return true;
  }

  const fromMatch = semVerRegExp.exec(from);
  const toMatch = semVerRegExp.exec(to);

  if (fromMatch === null || toMatch === null) {
    return true;
  }

  const fromMatchGroups = fromMatch.groups;
  const toMatchGroups = toMatch.groups;

  const fromMajor = fromMatchGroups?.major;
  const toMajor = toMatchGroups?.major;

  if (fromMajor === undefined || toMajor === undefined) {
    return true;
  }

  if (parseInt(fromMajor, 10) !== parseInt(toMajor, 10)) {
    return false;
  }

  const fromMinor = fromMatchGroups?.minor;
  const toMinor = toMatchGroups?.minor;

  if (fromMinor === undefined || toMinor === undefined) {
    return true;
  }

  if (parseInt(fromMinor, 10) !== parseInt(toMinor, 10)) {
    return category === 'MINOR';
  }

  return false;
};
