/**
 * @webhook-pragma check_suite
 */

import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { mergePullRequestMutation } from '../../graphql/mutations';
import { checkSuiteHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');
const infoSpy = jest.spyOn(core, 'info').mockImplementation();
const warningSpy = jest.spyOn(core, 'warning').mockImplementation();

describe('check Suite event handler', (): void => {
  it('does not log warnings when it gets triggered by Dependabot', async (): Promise<
    void
  > => {
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
                        messageHeadline: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeStateStatus: 'CLEAN',
              mergeable: 'MERGEABLE',
              merged: false,
              reviews: {
                edges: [],
              },
              state: 'OPEN',
            },
          },
        },
      });
    nock('https://api.github.com').post('/graphql').reply(OK);

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]');

    expect(warningSpy).not.toHaveBeenCalled();
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
                        messageHeadline: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeStateStatus: 'CLEAN',
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
        query: mergePullRequestMutation,
        variables: {
          commitHeadline: COMMIT_HEADLINE,
          pullRequestId: PULL_REQUEST_ID,
        },
      })
      .reply(OK);

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]');
  });

  it('does not approve pull requests that are not mergeable', async (): Promise<
    void
  > => {
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
                        messageHeadline: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeStateStatus: 'CLEAN',
              mergeable: 'CONFLICTING',
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

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]');

    expect(infoSpy).toHaveBeenCalledWith(
      'Pull request is not in a mergeable state: CONFLICTING.',
    );
  });

  it('does not approve pull requests that are already merged', async (): Promise<
    void
  > => {
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
                        messageHeadline: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeStateStatus: 'CLEAN',
              mergeable: 'MERGEABLE',
              merged: true,
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

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]');

    expect(infoSpy).toHaveBeenCalledWith('Pull request is already merged.');
  });

  it('does not approve pull requests for which status is not clean', async (): Promise<
    void
  > => {
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
                        messageHeadline: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeStateStatus: 'UNKNOWN',
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

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]');

    expect(infoSpy).toHaveBeenCalledWith(
      'Pull request cannot be merged cleanly. Current state: UNKNOWN.',
    );
  });

  it('does not approve pull requests for which state is not open', async (): Promise<
    void
  > => {
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
                        messageHeadline: COMMIT_HEADLINE,
                      },
                    },
                  },
                ],
              },
              id: PULL_REQUEST_ID,
              mergeStateStatus: 'CLEAN',
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
              state: 'CLOSED',
            },
          },
        },
      });

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]');

    expect(infoSpy).toHaveBeenCalledWith('Pull request is not open: CLOSED.');
  });

  it('does not merge if request not created by the selected GITHUB_LOGIN', async (): Promise<
    void
  > => {
    expect.assertions(1);

    await checkSuiteHandle(octokit, 'some-other-login');

    expect(infoSpy).toHaveBeenCalledWith(
      'Pull request not created by some-other-login, skipping.',
    );
  });

  it('logs a warning when it cannot find pull request ID by pull request number', async (): Promise<
    void
  > => {
    expect.assertions(1);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequest: null,
          },
        },
      });

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]');

    expect(warningSpy).toHaveBeenCalled();
  });
});
