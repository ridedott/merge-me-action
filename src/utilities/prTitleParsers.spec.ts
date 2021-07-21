import * as inputParsers from './inputParsers';
import { checkPullRequestTitleForMergePreset } from './prTitleParsers';

const parseInputMergePresetSpy = jest.spyOn(
  inputParsers,
  'parseInputMergePreset',
);

describe('checkPullRequestTitleForMergePreset', (): void => {
  it('returns true if category is undefined', (): void => {
    expect.assertions(1);

    parseInputMergePresetSpy.mockReturnValueOnce(undefined);

    expect(checkPullRequestTitleForMergePreset('')).toStrictEqual(true);
  });

  describe('given containing major bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 27.0.13';

    it.each(Object.values(inputParsers.AllowedMergePresets))(
      'returns false',
      (mergeCategory: inputParsers.AllowedMergePresets): void => {
        expect.assertions(1);

        parseInputMergePresetSpy.mockReturnValueOnce(mergeCategory);

        expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(false);
      },
    );
  });

  describe('given containing major bump and directory path', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 27.0.13 in /directory';

    it.each(Object.values(inputParsers.AllowedMergePresets))(
      'returns false',
      (mergeCategory: inputParsers.AllowedMergePresets): void => {
        expect.assertions(1);

        parseInputMergePresetSpy.mockReturnValueOnce(mergeCategory);

        expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(false);
      },
    );
  });

  describe('given title containing minor bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.1.0';

    it('returns true for DEPENDABOT_MINOR', (): void => {
      expect.assertions(1);

      parseInputMergePresetSpy.mockReturnValueOnce(
        inputParsers.AllowedMergePresets.DEPENDABOT_MINOR,
      );

      expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(true);
    });

    it('returns false for DEPENDABOT_PATCH', (): void => {
      expect.assertions(1);

      parseInputMergePresetSpy.mockReturnValueOnce(
        inputParsers.AllowedMergePresets.DEPENDABOT_PATCH,
      );

      expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(false);
    });
  });

  describe('given title containing minor bump and directory path', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.1.0 in /directory';

    it('returns true for DEPENDABOT_MINOR', (): void => {
      expect.assertions(1);

      parseInputMergePresetSpy.mockReturnValueOnce(
        inputParsers.AllowedMergePresets.DEPENDABOT_MINOR,
      );

      expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(true);
    });

    it('returns false for DEPENDABOT_PATCH', (): void => {
      expect.assertions(1);

      parseInputMergePresetSpy.mockReturnValueOnce(
        inputParsers.AllowedMergePresets.DEPENDABOT_PATCH,
      );

      expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(false);
    });
  });

  describe('given title containing patch bump', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.0.13';

    it.each(Object.values(inputParsers.AllowedMergePresets))(
      'returns true',
      (mergeCategory: inputParsers.AllowedMergePresets): void => {
        expect.assertions(1);

        parseInputMergePresetSpy.mockReturnValueOnce(mergeCategory);

        expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(true);
      },
    );
  });

  describe('given title containing patch bump and directory path', (): void => {
    const title = 'bump @types/jest from 26.0.12 to 26.0.13 in /directory';

    it.each(Object.values(inputParsers.AllowedMergePresets))(
      'returns true',
      (mergeCategory: inputParsers.AllowedMergePresets): void => {
        expect.assertions(1);

        parseInputMergePresetSpy.mockReturnValueOnce(mergeCategory);

        expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(true);
      },
    );
  });

  describe('given title containing malformed version bump', (): void => {
    const title = 'bump @types/jest from car to house';

    it.each(Object.values(inputParsers.AllowedMergePresets))(
      'returns true',
      (mergeCategory: inputParsers.AllowedMergePresets): void => {
        expect.assertions(1);

        parseInputMergePresetSpy.mockReturnValueOnce(mergeCategory);

        expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(true);
      },
    );
  });

  describe('given title does not contain a version bump', (): void => {
    const title = 'chore: format';

    it.each(Object.values(inputParsers.AllowedMergePresets))(
      'returns true',
      (mergeCategory: inputParsers.AllowedMergePresets): void => {
        expect.assertions(1);

        parseInputMergePresetSpy.mockReturnValueOnce(mergeCategory);

        expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(true);
      },
    );
  });

  describe('given title is capitalized', (): void => {
    const title = 'Bump @types/jest from 26.0.12 to 27.0.13';

    it.each(Object.values(inputParsers.AllowedMergePresets))(
      'returns false',
      (mergeCategory: inputParsers.AllowedMergePresets): void => {
        expect.assertions(1);

        parseInputMergePresetSpy.mockReturnValueOnce(mergeCategory);

        expect(checkPullRequestTitleForMergePreset(title)).toStrictEqual(false);
      },
    );
  });
});
