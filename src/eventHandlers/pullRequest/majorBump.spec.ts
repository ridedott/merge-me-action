/**
 * @webhook-pragma pull_request_for_major_bump
 */

import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { pullRequestHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = getOctokit('SECRET_GITHUB_TOKEN');
const getInputSpy = jest.spyOn(core, 'getInput').mockImplementation();

jest.spyOn(core, 'info').mockImplementation();

beforeEach((): void => {
  getInputSpy.mockReturnValue('DEPENDABOT_PATCH');
});

describe('pull request event handler', (): void => {
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

      await pullRequestHandle(octokit, 'dependabot-preview[bot]', 2);
    });
  });
});
