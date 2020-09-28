export const useSetTimeoutImmediateInvocation = (): jest.SpyInstance<
  NodeJS.Timeout,
  // eslint-disable-next-line unicorn/prevent-abbreviations
  [(...args: unknown[]) => void, number, ...unknown[]]
> =>
  jest
    .spyOn(global, 'setTimeout')
    .mockImplementation(
      (callback: () => void): NodeJS.Timeout =>
        (callback() as unknown) as NodeJS.Timeout,
    );
