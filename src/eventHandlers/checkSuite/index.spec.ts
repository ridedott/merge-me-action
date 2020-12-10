/**
 * @webhook-pragma check_suite
 */

import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { useSetTimeoutImmediateInvocation } from '../../../test/utilities';
import { mergePullRequestMutation } from '../../graphql/mutations';
import { AllowedMergeMethods } from '../../utilities/inputParsers';
import { checkSuiteHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = getOctokit('SECRET_GITHUB_TOKEN');
const infoSpy = jest.spyOn(core, 'info').mockImplementation();
const warningSpy = jest.spyOn(core, 'warning').mockImplementation();
const debugSpy = jest.spyOn(core, 'debug').mockImplementation();
const getInputSpy = jest.spyOn(core, 'getInput').mockImplementation();

beforeEach((): void => {
  getInputSpy.mockImplementation((name: string): string => {
    if (name === 'MERGE_METHOD') {
      return 'SQUASH';
    }

    if (name === 'PRESET') {
      return 'DEPENDABOT_MINOR';
    }

    return '';
  });
});

describe('check suite event handler', (): void => {
  it('does not log warnings when it gets triggered by Dependabot', async (): Promise<void> => {
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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
            },
          },
        },
      });
    nock('https://api.github.com').post('/graphql').reply(OK);

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 3);

    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('does not approve an already approved pull request', async (): Promise<void> => {
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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
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

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 3);
  });

  it('does not approve pull requests that are not mergeable', async (): Promise<void> => {
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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
            },
          },
        },
      });

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 3);

    expect(infoSpy).toHaveBeenCalledWith(
      'Pull request is not in a mergeable state: CONFLICTING.',
    );
  });

  it('does not approve pull requests that are already merged', async (): Promise<void> => {
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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
            },
          },
        },
      });

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 3);

    expect(infoSpy).toHaveBeenCalledWith('Pull request is already merged.');
  });

  it('does not approve pull requests for which status is not clean', async (): Promise<void> => {
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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
            },
          },
        },
      });

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 3);

    expect(infoSpy).toHaveBeenCalledWith(
      'Pull request cannot be merged cleanly. Current state: UNKNOWN.',
    );
  });

  it('does not approve pull requests for which state is not open', async (): Promise<void> => {
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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
            },
          },
        },
      });

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 3);

    expect(infoSpy).toHaveBeenCalledWith('Pull request is not open: CLOSED.');
  });

  it('does not merge if request not created by the selected GITHUB_LOGIN', async (): Promise<void> => {
    expect.assertions(1);

    await checkSuiteHandle(octokit, 'some-other-login', 3);

    expect(infoSpy).toHaveBeenCalledWith(
      'Pull request created by dependabot-preview[bot], not some-other-login, skipping.',
    );
  });

  it('logs a warning when it cannot find pull request ID by pull request number', async (): Promise<void> => {
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

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 3);

    expect(warningSpy).toHaveBeenCalled();
  });

  it('retries up to two times before failing', async (): Promise<void> => {
    expect.assertions(5);

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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
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

    useSetTimeoutImmediateInvocation();

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 2);

    expect(infoSpy).toHaveBeenCalledWith(
      'An error ocurred while merging the Pull Request. This is usually caused by the base branch being out of sync with the target branch. In this case, the base branch must be rebased. Some tools, such as Dependabot, do that automatically.',
    );
    expect(infoSpy).toHaveBeenCalledWith('Retrying in 1000...');
    expect(infoSpy).toHaveBeenCalledWith('Retrying in 4000...');
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      'Original error: HttpError: ##[error]GraphqlError: Base branch was modified. Review and try the merge again..',
    );
  });

  it('fails the backoff strategy when the error is not "Base branch was modified"', async (): Promise<void> => {
    expect.assertions(2);

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
              title: 'bump @types/jest from 26.0.12 to 26.1.0',
            },
          },
        },
      })
      .post('/graphql')
      .reply(403, '##[error]GraphqlError: This is a different error.');

    await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 2);

    expect(infoSpy).toHaveBeenCalledWith(
      'An error ocurred while merging the Pull Request. This is usually caused by the base branch being out of sync with the target branch. In this case, the base branch must be rebased. Some tools, such as Dependabot, do that automatically.',
    );
    expect(debugSpy).toHaveBeenCalledWith(
      'Original error: HttpError: ##[error]GraphqlError: This is a different error..',
    );
  });

  describe('for a dependabot initiated pull request', (): void => {
    it('does nothing if the PR title contains a major bump but PRESET specifies DEPENDABOT_PATCH', async (): Promise<void> => {
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
                  edges: [],
                },
                state: 'OPEN',
                title: 'bump @types/jest from 26.0.12 to 27.0.13',
              },
            },
          },
        });

      await checkSuiteHandle(octokit, 'dependabot-preview[bot]', 2);
    });
  });
});
