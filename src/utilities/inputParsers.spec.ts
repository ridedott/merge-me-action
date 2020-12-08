import * as actionsCore from '@actions/core';

import { parseInputMergeMethod, parseInputMergePreset } from './inputParsers';

const getInputSpy = jest.spyOn(actionsCore, 'getInput').mockImplementation();

describe('parseInputMergeMethod', (): void => {
  it.each(['MERGE', 'SQUASH', 'REBASE'])(
    'parse allowed method',
    (mergeMethod: string): void => {
      expect.assertions(1);

      getInputSpy.mockReturnValueOnce(mergeMethod);

      expect<unknown>(parseInputMergeMethod()).toStrictEqual(mergeMethod);
    },
  );

  it('returns default merge method if merge method is not allowed', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('OTHER');

    expect<unknown>(parseInputMergeMethod()).toStrictEqual('SQUASH');
  });

  it('returns undefined if merge method is not provided', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('');

    expect<unknown>(parseInputMergeMethod()).toStrictEqual('SQUASH');
  });
});

describe('parseInputMergePreset', (): void => {
  it.each(['DEPENDABOT_MINOR', 'DEPENDABOT_PATCH'])(
    'parse allowed category',
    (mergeCategory: string): void => {
      expect.assertions(1);

      getInputSpy.mockReturnValueOnce(mergeCategory);

      expect<unknown>(parseInputMergePreset()).toStrictEqual(mergeCategory);
    },
  );

  it('returns default merge category if merge category is not allowed', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('OTHER');

    expect(parseInputMergePreset()).toBeUndefined();
  });

  it('returns default merge category if merge category is not provided', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('');

    expect(parseInputMergePreset()).toBeUndefined();
  });
});
