/**
 * @webhook-pragma pull_request
 */

import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { useSetTimeoutImmediateInvocation } from '../../../test/utilities';
import { mergePullRequestMutation } from '../../graphql/mutations';
import { AllowedMergeMethods } from '../../utilities/inputParsers';
import * as log from '../../utilities/log';
import { pullRequestHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = getOctokit('SECRET_GITHUB_TOKEN');
const warningSpy = jest.spyOn(core, 'warning').mockImplementation();
const getInputSpy = jest.spyOn(core, 'getInput').mockImplementation();

jest.spyOn(core, 'info').mockImplementation();

beforeEach((): void => {
  getInputSpy.mockReturnValue('SQUASH');
});

describe('pull request event handler', (): void => {
  it('does not log warnings when it is triggered', async (): Promise<void> => {
    expect.assertions(1);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequest: {
              commits: {
                edges: [
                  {
                    node: {
                      commit: {
                        message: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeable: 'MERGEABLE',
              merged: false,
              reviews: {
                edges: [
                  {
                    node: {
                      state: 'APPROVED',
                    },
                  },
                ],
              },
              state: 'OPEN',
            },
          },
        },
      });
    nock('https://api.github.com').post('/graphql').reply(OK);

    await pullRequestHandle(octokit, 'dependabot-preview[bot]', 2);

    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('does nothing if response is null', async (): Promise<void> => {
    expect.assertions(0);

    nock('https://api.github.com').post('/graphql').reply(OK, {
      data: null,
    });

    await pullRequestHandle(octokit, 'dependabot-preview[bot]', 2);
  });

  it('does not approve an already approved pull request', async (): Promise<
    void
  > => {
    expect.assertions(0);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequest: {
              commits: {
                edges: [
                  {
                    node: {
                      commit: {
                        message: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeable: 'MERGEABLE',
              merged: false,
              reviews: {
                edges: [
                  {
                    node: {
                      state: 'APPROVED',
                    },
                  },
                ],
              },
              state: 'OPEN',
            },
          },
        },
      });
    nock('https://api.github.com')
      .post('/graphql', {
        query: mergePullRequestMutation(AllowedMergeMethods.SQUASH),
        variables: {
          commitHeadline: COMMIT_HEADLINE,
          pullRequestId: PULL_REQUEST_ID,
        },
      })
      .reply(OK);

    await pullRequestHandle(octokit, 'dependabot-preview[bot]', 2);
  });

  it('retries up to two times before failing', async (): Promise<void> => {
    expect.assertions(6);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequest: {
              commits: {
                edges: [
                  {
                    node: {
                      commit: {
                        message: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeable: 'MERGEABLE',
              merged: false,
              reviews: {
                edges: [
                  {
                    node: {
                      state: 'APPROVED',
                    },
                  },
                ],
              },
              state: 'OPEN',
            },
          },
        },
      })
      .post('/graphql')
      .times(3)
      .reply(
        403,
        '##[error]GraphqlError: Base branch was modified. Review and try the merge again.',
      );

    const logDebugSpy = jest.spyOn(log, 'logDebug');
    const logInfoSpy = jest.spyOn(log, 'logInfo');

    useSetTimeoutImmediateInvocation();

    try {
      await pullRequestHandle(octokit, 'dependabot-preview[bot]', 2);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toStrictEqual(
        '##[error]GraphqlError: Base branch was modified. Review and try the merge again.',
      );
      expect(logDebugSpy).toHaveBeenCalledTimes(3);
      expect(logInfoSpy.mock.calls[1][0]).toStrictEqual(
        'An error ocurred while merging the Pull Request. This is usually caused by the base branch being out of sync with the target branch. In this case, the base branch must be rebased. Some tools, such as Dependabot, do that automatically.',
      );
      expect(logInfoSpy.mock.calls[2][0]).toStrictEqual('Retrying in 1000...');
      expect(logInfoSpy.mock.calls[4][0]).toStrictEqual('Retrying in 4000...');
    }
  });

  it('fails the backoff strategy when the error is not "Base branch was modified"', async (): Promise<
    void
  > => {
    expect.assertions(3);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequest: {
              commits: {
                edges: [
                  {
                    node: {
                      commit: {
                        message: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeable: 'MERGEABLE',
              merged: false,
              reviews: {
                edges: [
                  {
                    node: {
                      state: 'APPROVED',
                    },
                  },
                ],
              },
              state: 'OPEN',
            },
          },
        },
      })
      .post('/graphql')
      .reply(403, '##[error]GraphqlError: This is a different error.');

    const logInfoSpy = jest.spyOn(log, 'logInfo');

    try {
      await pullRequestHandle(octokit, 'dependabot-preview[bot]', 2);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toStrictEqual(
        '##[error]GraphqlError: This is a different error.',
      );
      expect(logInfoSpy.mock.calls[1][0]).toStrictEqual(
        'An error ocurred while merging the Pull Request. This is usually caused by the base branch being out of sync with the target branch. In this case, the base branch must be rebased. Some tools, such as Dependabot, do that automatically.',
      );
    }
  });
});
