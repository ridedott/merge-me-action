/**
 * @webhook-pragma pull_request
 */

import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { mergePullRequestMutation } from '../../graphql/mutations';
import { AllowedMergeMethods } from '../../utilities/inputParsers';
import { pullRequestHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');
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

    await pullRequestHandle(octokit, 'dependabot-preview[bot]');

    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('does nothing if response is null', async (): Promise<void> => {
    expect.assertions(0);

    nock('https://api.github.com').post('/graphql').reply(OK, {
      data: null,
    });

    await pullRequestHandle(octokit, 'dependabot-preview[bot]');
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

    await pullRequestHandle(octokit, 'dependabot-preview[bot]');
  });
});
