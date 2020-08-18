export const useSetTimeoutImmediateInvocation = (): jest.SpyInstance<
  NodeJS.Timeout,
  [(...args: unknown[]) => void, number, ...unknown[]]
> =>
  jest
    .spyOn(global, 'setTimeout')
    .mockImplementation(
      (callback: () => void): NodeJS.Timeout =>
        (callback() as unknown) as NodeJS.Timeout,
    );
