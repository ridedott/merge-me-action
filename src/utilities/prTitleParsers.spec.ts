import { checkPullRequestTitleForMergeCategory } from './prTitleParsers';

describe('checkPullRequestTitleForMergeCategory', (): void => {
  describe('given containing MAJOR bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 27.0.13';

    it.each(['MAJOR'])('returns true', (mergeCategory: string): void => {
      expect.assertions(1);

      expect(
        checkPullRequestTitleForMergeCategory(title, mergeCategory),
      ).toStrictEqual(true);
    });

    it.each(['MINOR', 'PATCH'])(
      'returns false',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(false);
      },
    );
  });

  describe('given title containing MINOR bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.1.0';

    it.each(['MAJOR', 'MINOR'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergeCategory(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );

    it.each(['PATCH'])('returns false', (mergeCategory: string): void => {
      expect.assertions(1);

      expect(
        checkPullRequestTitleForMergeCategory(title, mergeCategory),
      ).toStrictEqual(false);
    });
  });

  describe('given title containing PATCH bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.0.13';

    it.each(['MAJOR', 'MINOR', 'PATCH'])(
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
    const title = 'bump @types/jest from jora=m to natan';

    it.each(['MAJOR', 'MINOR', 'PATCH'])(
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

    it.each(['MAJOR', 'MINOR', 'PATCH'])(
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
