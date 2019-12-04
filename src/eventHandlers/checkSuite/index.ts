/* eslint-disable no-await-in-loop */

import { info, warning } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { DEPENDABOT_GITHUB_LOGIN } from '../../constants';
import { findPullRequestInfo } from '../../graphql/queries';
import { mutationSelector } from '../../util';

export const checkSuiteHandle = async (octokit: GitHub): Promise<void> => {
  const pullRequests = context.payload.check_suite.pull_requests;

  for (const pullRequest of pullRequests) {
    if (
      typeof context.payload.sender === 'object' &&
      context.payload.sender.login === DEPENDABOT_GITHUB_LOGIN
    ) {
      try {
        const pullRequestNumber = pullRequest.number;
        const repositoryName = context.repo.repo;
        const repositoryOwner = context.repo.owner;
        const {
          repository: {
            pullRequest: {
              id: pullRequestId,
              commits: {
                edges: [
                  {
                    node: {
                      commit: { message: commitHeadline },
                    },
                  },
                ],
              },
              reviews: {
                edges: [reviewEdge],
              },
              mergeable: mergeableState,
              merged,
              state: pullRequestState,
            },
          },
        } = await octokit.graphql(findPullRequestInfo, {
          pullRequestNumber,
          repositoryName,
          repositoryOwner,
        });

        info(
          `checkSuiteHandle: PullRequestId: ${pullRequestId as string}, commitHeadline: ${commitHeadline as string}.`,
        );

        if (
          mergeableState === 'MERGEABLE' &&
          merged === false &&
          pullRequestState === 'OPEN'
        ) {
          await octokit.graphql(mutationSelector(reviewEdge), {
            commitHeadline,
            pullRequestId,
          });
        } else {
          warning('Pull Request is not in a mergeable state');
        }
      } catch (error) {
        warning(error);
        warning(JSON.stringify(error));
      }
    } else {
      info('Pull request not created by Dependabot, skipping.');
    }
  }
};
