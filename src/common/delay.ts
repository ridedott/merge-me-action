export const delay = async (duration: number): Promise<void> =>
  new Promise((resolve: () => void): void => {
    setTimeout((): void => {
      resolve();
    }, duration);
  });
