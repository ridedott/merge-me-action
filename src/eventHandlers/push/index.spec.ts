/**
 * @webhook-pragma push
 */

import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { mergePullRequestMutation } from '../../graphql/mutations';
import { AllowedMergeMethods } from '../../utilities/inputParsers';
import { pushHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = getOctokit('SECRET_GITHUB_TOKEN');
const infoSpy = jest.spyOn(core, 'info').mockImplementation();
const warningSpy = jest.spyOn(core, 'warning').mockImplementation();
const getInputSpy = jest.spyOn(core, 'getInput').mockImplementation();

beforeEach((): void => {
  getInputSpy.mockReturnValue('SQUASH');
});

describe('push event handler', (): void => {
  it('does not log warnings when it is triggered by Dependabot', async (): Promise<
    void
  > => {
    expect.assertions(1);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequests: {
              nodes: [
                {
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
              ],
            },
          },
        },
      });
    nock('https://api.github.com').post('/graphql').reply(OK);

    await pushHandle(octokit, 'dependabot-preview[bot]');

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
            pullRequests: {
              nodes: [
                {
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
              ],
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

    await pushHandle(octokit, 'dependabot-preview[bot]');
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
            pullRequests: {
              nodes: [
                {
                  id: PULL_REQUEST_ID,
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
              ],
            },
          },
        },
      });

    await pushHandle(octokit, 'dependabot-preview[bot]');

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
            pullRequests: {
              nodes: [
                {
                  id: PULL_REQUEST_ID,
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
              ],
            },
          },
        },
      });

    await pushHandle(octokit, 'dependabot-preview[bot]');

    expect(infoSpy).toHaveBeenCalledWith('Pull request is already merged.');
  });

  it('does not approve pull request which state is not open', async (): Promise<
    void
  > => {
    expect.assertions(1);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequests: {
              nodes: [
                {
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
                  state: 'CLOSED',
                },
              ],
            },
          },
        },
      });

    await pushHandle(octokit, 'dependabot-preview[bot]');

    expect(infoSpy).toHaveBeenCalledWith('Pull request is not open: CLOSED.');
  });

  it('does not merge if request not created by the selected GITHUB_LOGIN', async (): Promise<
    void
  > => {
    expect.assertions(1);

    await pushHandle(octokit, 'some-other-login');

    expect(infoSpy).toHaveBeenCalledWith(
      'Pull request created by dependabot-preview[bot], not some-other-login, skipping.',
    );
  });

  it('logs a warning when it cannot find pull request node id', async (): Promise<
    void
  > => {
    expect.assertions(1);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequests: {
              nodes: [],
            },
          },
        },
      });

    await pushHandle(octokit, 'dependabot-preview[bot]');

    expect(warningSpy).toHaveBeenCalled();
  });
});
