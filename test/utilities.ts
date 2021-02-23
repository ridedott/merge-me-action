/* eslint-disable @typescript-eslint/no-confusing-void-expression */
export const useSetTimeoutImmediateInvocation = (): jest.SpyInstance<
  NodeJS.Timeout,
  [
    callback: (...arguments_: unknown[]) => void,
    ms?: number | undefined,
    ...arguments_: unknown[]
  ]
> =>
  jest
    .spyOn(global, 'setTimeout')
    .mockImplementation(
      (callback: () => void): NodeJS.Timeout =>
        (callback() as unknown) as NodeJS.Timeout,
    );
