import * as core from '@actions/core';

import { logDebug, logError, logInfo, logWarning } from './log';

const debugSpy = jest.spyOn(core, 'debug').mockImplementation();
const errorSpy = jest.spyOn(core, 'error').mockImplementation();
const infoSpy = jest.spyOn(core, 'info').mockImplementation();
const warningSpy = jest.spyOn(core, 'warning').mockImplementation();

const errorWithoutStack = new Error('I am an error.');
delete errorWithoutStack.stack;

const errorWithStack = new Error('I am an error.');
/* eslint-disable-next-line immutable/no-mutation */
errorWithStack.stack = 'I am a stack.';

describe.each<
  [string, (value: unknown) => void, jest.SpyInstance<void, [string | Error]>]
>([
  ['logError', logError, errorSpy],
  ['logWarning', logWarning, warningSpy],
])(
  '%s',
  (
    _: string,
    logFunction: (value: unknown) => void,
    coreFunction: jest.SpyInstance<void, [string | Error]>,
  ): void => {
    it.each<[unknown, string]>([
      ['I am a string.', 'I am a string.'],
      [{ property: 1 }, '{"property":1}'],
      [errorWithoutStack, 'Error: I am an error.'],
      [errorWithStack, 'I am a stack.'],
      [1, '1'],
    ])(
      'logs value in a correct format (sample %#)',
      (logged: unknown, expected: string): void => {
        expect.assertions(1);

        logFunction(logged);

        expect(coreFunction).toHaveBeenCalledWith(expected);
      },
    );
  },
);

describe.each<
  [string, (value: unknown) => void, jest.SpyInstance<void, [string]>]
>([
  ['logDebug', logDebug, debugSpy],
  ['logInfo', logInfo, infoSpy],
])(
  '%s',
  (
    _: string,
    logFunction: (value: unknown) => void,
    coreFunction: jest.SpyInstance<void, [string]>,
  ): void => {
    it.each<[unknown, string]>([
      ['I am a string.', 'I am a string.'],
      [{ property: 1 }, '{"property":1}'],
      [errorWithoutStack, 'Error: I am an error.'],
      [errorWithStack, 'I am a stack.'],
      [1, '1'],
    ])(
      'logs value in a correct format (sample %#)',
      (logged: unknown, expected: string): void => {
        expect.assertions(1);

        logFunction(logged);

        expect(coreFunction).toHaveBeenCalledWith(expected);
      },
    );
  },
);
