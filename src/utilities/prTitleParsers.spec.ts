import { checkPullRequestTitleForMergeCategory } from './prTitleParsers';

describe('checkPullRequestTitleForMergeCategory', (): void => {
  describe('given containing DEPENDABOT_MAJOR bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 27.0.13';

    it.each(['DEPENDABOT_MAJOR'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );

    it.each(['DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns false',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(false);
      },
    );
  });

  describe('given title containing DEPENDABOT_MINOR bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.1.0';

    it.each(['DEPENDABOT_MAJOR', 'DEPENDABOT_MINOR'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );

    it.each(['DEPENDABOT_PATCH'])(
      'returns false',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(false);
      },
    );
  });

  describe('given title containing DEPENDABOT_PATCH bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.0.13';

    it.each(['DEPENDABOT_MAJOR', 'DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );
  });

  describe('given title containing malformed version bump', (): void => {
    const title = 'bump @types/jest from car to house';

    it.each(['DEPENDABOT_MAJOR', 'DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );
  });

  describe('given title does not contain a version bump', (): void => {
    const title = 'chore: format';

    it.each(['DEPENDABOT_MAJOR', 'DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );
  });
});
