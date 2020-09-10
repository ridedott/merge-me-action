import * as actionsCore from '@actions/core';

import { parseInputMergeMethod } from './inputParsers';
import {parseInputMergeCategory} from './inputParsers.ts';

const getInputSpy = jest.spyOn(actionsCore, 'getInput').mockImplementation();

describe('parseInputMergeMethod', (): void => {
  it.each(['MERGE', 'SQUASH', 'REBASE'])(
    'parse allowed method',
    (mergeMethod: string): void => {
      expect.assertions(1);

      getInputSpy.mockReturnValueOnce(mergeMethod);

      expect(parseInputMergeMethod()).toStrictEqual(mergeMethod);
    },
  );

  it('returns default merge method if merge method is not allowed', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('OTHER');

    expect(parseInputMergeMethod()).toStrictEqual('SQUASH');
  });

  it('returns undefined if merge method is not provided', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('');

    expect(parseInputMergeMethod()).toStrictEqual('SQUASH');
  });
});

describe('parseInputMergeCategory', (): void => {
  it.each(['MAJOR', 'MINOR', 'PATCH', 'ANY'])(
    'parse allowed category',
    (mergeCategory: string): void => {
      expect.assertions(1);

      getInputSpy.mockReturnValueOnce(mergeCategory);

      expect(parseInputMergeCategory()).toStrictEqual(mergeCategory);
    },
  );

  it('returns default merge category if merge category is not allowed', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('OTHER');

    expect(parseInputMergeCategory()).toStrictEqual('ANY');
  });

  it('returns undefined if merge category is not provided', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('');

    expect(parseInputMergeCategory()).toStrictEqual('ANY');
  });
});
