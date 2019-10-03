import { GitHub } from '@actions/github';
import * as nock from 'nock';

import { pullRequestHandle } from '.';

const octokit = new GitHub('SECRET_GITHUB_TOKEN');

describe('pull request event handler', () => {
  it('should not throw any error when it gets a Pull Request ID', async () => {
    expect.assertions(1);

    const HTTP_STATUS = 200;

    nock('https://api.github.com')
      .post('/graphql')
      .reply(HTTP_STATUS, {
        data: {
          repository: {
            /* cspell:disable-next-line */
            pullRequest: { id: 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4' },
          },
        },
      });
    nock('https://api.github.com')
      .post('/graphql')
      .reply(HTTP_STATUS);

    expect(async () => pullRequestHandle(octokit)).not.toThrow();
  });
});
