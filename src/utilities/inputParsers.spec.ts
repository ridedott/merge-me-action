import * as actionsCore from '@actions/core';

import { parseInputMergeMethod } from './inputParsers';

const getInputSpy = jest.spyOn(actionsCore, 'getInput').mockImplementation();

describe('parseInputMergeMethod', (): void => {
  it('parse allowed method', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('MERGE');

    expect(parseInputMergeMethod()).toStrictEqual('MERGE');
  });

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
