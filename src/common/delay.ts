export const EXPONENTIAL_BACKOFF = 2;
export const MINIMUM_WAIT_TIME = 1000;

export const delay = async (duration: number): Promise<void> =>
  new Promise((resolve: () => void): void => {
    setTimeout((): void => {
      resolve();
    }, duration);
  });
