import { parsePRTitle } from './prTitleParser';

var title: string = '';

describe('parsePRTitle', (): void => {
  describe('given containing MAJOR bump', (): void => {
    beforeEach((): void => {
      title = 'bump @types/jest from 26.0.12 to 27.0.13';
    });

    it.each(['MAJOR'])('returns true', (mergeCategory: string): void => {
      expect.assertions(1);

      expect(parsePRTitle(title, mergeCategory)).toStrictEqual(true);
    });

    it.each(['MINOR', 'PATCH'])(
      'returns false',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(parsePRTitle(title, mergeCategory)).toStrictEqual(false);
      },
    );
  });

  describe('given title containing MINOR bump', (): void => {
    beforeEach((): void => {
      title = 'bump @types/jest from 26.0.12 to 26.1.0';
    });

    it.each(['MAJOR', 'MINOR'])(
      'returns true',
      (mergeCategory: string): void => {
        expect.assertions(1);

        expect(parsePRTitle(title, mergeCategory)).toStrictEqual(true);
      },
    );

    it.each(['PATCH'])('returns false', (mergeCategory: string): void => {
      expect.assertions(1);

      expect(parsePRTitle(title, mergeCategory)).toStrictEqual(false);
    });
  });

  describe('given title containing PATCH bump', (): void => {});
});
