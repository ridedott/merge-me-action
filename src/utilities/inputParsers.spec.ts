import * as actionsCore from '@actions/core';

import { parseInputMergeMethod } from './inputParsers';

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
