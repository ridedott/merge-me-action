// TODO: (dunyakirkali) Better naming
export const parsePRTitle = (title: string, category: string): boolean => {
  if (category === 'MAJOR') {
    return true;
  }

  const semVerTitleRegExp = /bump .* from (?<from>.*) to (?<to>.*)/u;
  const match = semVerTitleRegExp.exec(title);

  if (match) {
    const semVerRegExp = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/u;

    const matchGroups = match.groups;
    const from = matchGroups?.from;
    const to = matchGroups?.to;

    if (from === undefined || to === undefined) {
      return true;
    }

    // TODO: (dunyakirkali) Handle optionals
    const fromMatch = semVerRegExp.exec(from)!;
    const toMatch = semVerRegExp.exec(to)!;

    // TODO: (dunyakirkali) Handle optionals
    const fromVersion = fromMatch.groups!;
    const toVersion = toMatch.groups!;

    if (parseInt(fromVersion.major) !== parseInt(toVersion.major)) {
      return false;
    }

    if (parseInt(fromVersion.minor) !== parseInt(toVersion.minor)) {
      return category === 'MINOR';
    }
  }

  return false;
};
