import * as nock from 'nock';

beforeAll((): void => {
  nock.disableNetConnect();
});

afterEach((): void => {
  // Reset all mocks after each test run.
  jest.clearAllMocks();

  // Assert all HTTP mocks were called.
  if (nock.isDone() !== true) {
    const pending = nock.pendingMocks();

    nock.cleanAll();

    throw new Error(`Pending mocks detected: ${pending.toString()}.`);
  }

  // Reset network recording after each test run.
  nock.restore();
  nock.activate();
});
