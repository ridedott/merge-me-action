import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { checkSuiteHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');

describe('check Suite event handler', () => {
  it('does not throw any warning issue when it gets triggered by Dependabot', async () => {
    expect.assertions(3);

    const successLog = `checkSuiteHandle: PullRequestId: ${PULL_REQUEST_ID}, commitHeadline: Update test.`;
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
            pullRequest: { id: PULL_REQUEST_ID },
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

  it('does throw a warning issue when it cannot find pull request id by pull request number', async () => {
    expect.assertions(3);

    const successLog = `checkSuiteHandle: PullRequestId: ${PULL_REQUEST_ID}, commitHeadline: Update test.`;
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
