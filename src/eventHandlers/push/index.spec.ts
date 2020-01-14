/**
 * @webhook-pragma push
 */

import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { mergePullRequestMutation } from '../../graphql/mutations';
import { pushHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');

jest.spyOn(core, 'info').mockImplementation();

const warningSpy = jest.spyOn(core, 'warning').mockImplementation();

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
    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK);

    await pushHandle(octokit);

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
        query: mergePullRequestMutation,
        variables: {
          commitHeadline: COMMIT_HEADLINE,
          pullRequestId: PULL_REQUEST_ID,
        },
      })
      .reply(OK);

    await pushHandle(octokit);
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

    await pushHandle(octokit);

    expect(warningSpy).toHaveBeenCalled();
  });
});
