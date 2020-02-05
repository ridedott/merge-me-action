import { debug, error, info, warning } from '@actions/core';

const stringify = (value: unknown): string =>
  typeof value === 'string'
    ? value
    : value instanceof Error
    ? value.stack ?? value.toString()
    : typeof value === 'number'
    ? value.toString()
    : JSON.stringify(value);

const log = (logger: (value: string) => void): ((message: unknown) => void) => (
  message: unknown,
): void => logger(stringify(message));

export const logDebug = log(debug);
export const logError = log(error);
export const logInfo = log(info);
export const logWarning = log(warning);
