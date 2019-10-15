/**
 * @webhook-pragma check_suite
 */

import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import {
  approveAndMergePullRequestMutation,
  mergePullRequestMutation,
} from '../../graphql/mutations';
import { checkSuiteHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');

describe('check Suite event handler', (): void => {
  it('does not throw any warning issue when it gets triggered by Dependabot', async (): Promise<
    void
  > => {
    expect.assertions(3);

    const successLog = `checkSuiteHandle: PullRequestId: ${PULL_REQUEST_ID}, commitHeadline: ${COMMIT_HEADLINE}.`;
    const skipLog = 'Pull request not created by Dependabot, skipping.';

    const infoSpy = jest
      .spyOn(core, 'info')
      .mockImplementation((): null => null);
    const warningSpy = jest
      .spyOn(core, 'warning')
      .mockImplementation((): null => null);

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
                edges: [],
              },
              state: 'OPEN',
            },
          },
        },
      });
    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK);

    await checkSuiteHandle(octokit);

    expect(infoSpy).toHaveBeenCalledWith(successLog);
    expect(infoSpy).not.toHaveBeenCalledWith(skipLog);
    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('does not approve an already approved pull request', async (): Promise<
    void
  > => {
    expect.assertions(5);

    const successLog = `checkSuiteHandle: PullRequestId: ${PULL_REQUEST_ID}, commitHeadline: ${COMMIT_HEADLINE}.`;
    const skipLog = 'Pull request not created by Dependabot, skipping.';
    const mutationVariables = {
      commitHeadline: COMMIT_HEADLINE,
      pullRequestId: PULL_REQUEST_ID,
    };

    const graphqlSpy = jest.spyOn(octokit, 'graphql');
    const infoSpy = jest
      .spyOn(core, 'info')
      .mockImplementation((): null => null);
    const warningSpy = jest
      .spyOn(core, 'warning')
      .mockImplementation((): null => null);

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
      .post('/graphql')
      .reply(OK);

    await checkSuiteHandle(octokit);

    expect(graphqlSpy).toHaveBeenNthCalledWith(
      2,
      mergePullRequestMutation,
      mutationVariables,
    );
    expect(graphqlSpy).not.toHaveBeenNthCalledWith(
      2,
      approveAndMergePullRequestMutation,
    );
    expect(infoSpy).toHaveBeenLastCalledWith(successLog);
    expect(infoSpy).not.toHaveBeenCalledWith(skipLog);
    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('does throw a warning issue when it cannot find pull request id by pull request number', async (): Promise<
    void
  > => {
    expect.assertions(3);

    const successLog = `checkSuiteHandle: PullRequestId: ${PULL_REQUEST_ID}, commitHeadline: ${COMMIT_HEADLINE}.`;
    const skipLog = 'Pull request not created by Dependabot, skipping.';

    const infoSpy = jest
      .spyOn(core, 'info')
      .mockImplementation((): null => null);
    const warningSpy = jest
      .spyOn(core, 'warning')
      .mockImplementation((): null => null);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequest: null,
          },
        },
      });
    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK);

    await checkSuiteHandle(octokit);

    expect(infoSpy).not.toHaveBeenLastCalledWith(successLog);
    expect(infoSpy).not.toHaveBeenCalledWith(skipLog);
    expect(warningSpy).toHaveBeenCalled();
  });
});
