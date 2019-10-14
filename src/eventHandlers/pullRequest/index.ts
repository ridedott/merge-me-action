import { info, warning } from '@actions/core';
import { context, GitHub } from '@actions/github';
import { PayloadRepository } from '@actions/github/lib/interfaces';

import { DEPENDABOT_GITHUB_LOGIN } from '../../constants';
import { findPullRequestLastApprovedReview } from '../../graphql/queries';
import { mutationSelector } from '../../util';

export const pullRequestHandle = async (octokit: GitHub): Promise<void> => {
  const pullRequest = context.payload.pull_request;

  if (pullRequest === undefined) {
    warning('Pull request information is unavailable.');
  } else if (pullRequest.user.login === DEPENDABOT_GITHUB_LOGIN) {
    try {
      const commitHeadline = pullRequest.title;
      const pullRequestId = pullRequest.node_id;
      const pullRequestNumber = pullRequest.number;
      const {
        name: repositoryName,
        owner: { login: repositoryOwner },
      } = context.payload.repository as PayloadRepository;

      info(
        `pullRequestHandle: PullRequestId: ${pullRequestId}, commitHeadline: ${commitHeadline}.`,
      );
      const {
        repository: {
          pullRequest: {
            reviews: {
              edges: [reviewEdge],
            },
          },
        },
      } = await octokit.graphql(findPullRequestLastApprovedReview, {
        pullRequestNumber,
        repositoryName,
        repositoryOwner,
      });

      await octokit.graphql(mutationSelector(reviewEdge), {
        commitHeadline: pullRequest.title,
        pullRequestId: pullRequest.node_id,
      });
    } catch (error) {
      warning(error);
      warning(JSON.stringify(error));
    }
  } else {
    info('Pull request not created by Dependabot, skipping.');
  }
};
