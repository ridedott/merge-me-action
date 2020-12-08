/**
 * @webhook-pragma check_suite
 */

import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { OK } from 'http-status-codes';
import * as nock from 'nock';

import { checkSuiteHandle } from '.';

/* cspell:disable-next-line */
const PULL_REQUEST_ID = 'MDExOlB1bGxSZXF1ZXN0MzE3MDI5MjU4';
const COMMIT_HEADLINE = 'Update test';

const octokit = getOctokit('SECRET_GITHUB_TOKEN');
const getInputSpy = jest.spyOn(core, 'getInput').mockImplementation();

jest.spyOn(core, 'info').mockImplementation();

beforeEach((): void => {
  getInputSpy.mockReturnValue('DEPENDABOT_PATCH');
});

describe('check suite event handler', (): void => {
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
