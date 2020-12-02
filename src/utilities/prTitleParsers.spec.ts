import { checkPullRequestTitleForMergePreset } from './prTitleParsers';

describe('checkPullRequestTitleForMergePreset', (): void => {
  describe('given containing major bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 27.0.13';

    it.each(['DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns false',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergePreset(title, mergeCategory),
        ).toStrictEqual(false);
      },
    );
  });

  describe('given title containing minor bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.1.0';

    it.each(['DEPENDABOT_MINOR'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergePreset(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );

    it.each(['DEPENDABOT_PATCH'])(
      'returns false',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergePreset(title, mergeCategory),
        ).toStrictEqual(false);
      },
    );
  });

  describe('given title containing patch bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.0.13';

    it.each(['DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergePreset(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );
  });

  describe('given title containing malformed version bump', (): void => {
    const title = 'bump @types/jest from car to house';

    it.each(['DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergePreset(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );
  });

  describe('given title does not contain a version bump', (): void => {
    const title = 'chore: format';

    it.each(['DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergePreset(title, mergeCategory),
        ).toStrictEqual(true);
      },
    );
  });

  describe('given title is capitalized', (): void => {
    const title = 'Bump @types/jest from 26.0.12 to 27.0.13';

    it.each(['DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
      'returns false',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(
          checkPullRequestTitleForMergePreset(title, mergeCategory),
        ).toStrictEqual(false);
      },
    );
  });
});
