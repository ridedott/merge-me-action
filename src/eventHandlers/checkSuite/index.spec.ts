import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import * as HttpStatus from 'http-status-codes';
import * as nock from 'nock';

import { checkSuiteHandle } from '.';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');

describe('check Suite event handler', () => {
  it('should not throw any warning issue when it gets triggered', async () => {
    expect.assertions(2);

    const infoSpy = jest.spyOn(core, 'info');
    const warningSpy = jest.spyOn(core, 'warning');

    nock('https://api.github.com')
      .post('/graphql')
      .reply(HttpStatus.OK, {
        data: {
          repository: {
            /* cspell:disable-next-line */
            pullRequest: { id: 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4' },
          },
        },
      });
    nock('https://api.github.com')
      .post('/graphql')
      .reply(HttpStatus.OK);

    await checkSuiteHandle(octokit);

    expect(infoSpy).toHaveBeenCalled();
    expect(warningSpy).not.toHaveBeenCalled();
  });
});
