import { delay } from './delay';

it('resolves promise after waiting for the specified duration', async (): Promise<void> => {
  expect.assertions(1);

  const start = Date.now();

  await delay(50);

  expect(Date.now()).toBeGreaterThanOrEqual(start + 50);
});
