import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { pushHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');

describe('push event handler', () => {
  it('does not throw any warning issue when it gets triggered by Dependabot', async () => {
    expect.assertions(3);

    const successLog = `pushHandle: PullRequestId: ${PULL_REQUEST_ID}, commitHeadline: Update test.`;
    const skipLog = 'Pull request not created by Dependabot, skipping.';

    const infoSpy = jest.spyOn(core, 'info').mockImplementation(() => null);
    const warningSpy = jest
      .spyOn(core, 'warning')
      .mockImplementation(() => null);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK, {
        data: {
          repository: {
            pullRequests: {
              nodes: [{ id: PULL_REQUEST_ID }],
            },
          },
        },
      });
    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK);

    await pushHandle(octokit);

    expect(infoSpy).toHaveBeenCalledWith(successLog);
    expect(infoSpy).not.toHaveBeenCalledWith(skipLog);
    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('does throw a warning issue when it cannot find pull request node id', async () => {
    expect.assertions(3);

    const successLog = `pushHandle: PullRequestId: ${PULL_REQUEST_ID}, commitHeadline: Update test.`;
    const skipLog = 'Pull request not created by Dependabot, skipping.';

    const infoSpy = jest.spyOn(core, 'info').mockImplementation(() => null);
    const warningSpy = jest
      .spyOn(core, 'warning')
      .mockImplementation(() => null);
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
    nock('https://api.github.com')
      .post('/graphql')
      .reply(OK);

    await pushHandle(octokit);

    expect(infoSpy).not.toHaveBeenLastCalledWith(successLog);
    expect(infoSpy).not.toHaveBeenCalledWith(skipLog);
    expect(warningSpy).toHaveBeenCalled();
  });
});
