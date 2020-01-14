import {
  error as logError,
  info as logInfo,
  warning as logWarning,
} from '@actions/core';
import { context, GitHub } from '@actions/github';

import { DEPENDABOT_GITHUB_LOGIN } from '../../constants';
import { findPullRequestLastApprovedReview } from '../../graphql/queries';
import { mutationSelector } from '../../util';

interface PullRequestInformation {
  reviewEdges: Array<
    | {
        node: {
          state:
            | 'APPROVED'
            | 'CHANGES_REQUESTED'
            | 'COMMENTED'
            | 'DISMISSED'
            | 'PENDING';
        };
      }
    | undefined
  >;
}

const getPullRequestInformation = async (
  octokit: GitHub,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformation | undefined> => {
  const response = await octokit.graphql(
    findPullRequestLastApprovedReview,
    query,
  );

  if (response === null) {
    return undefined;
  }

  const {
    repository: {
      pullRequest: {
        reviews: { edges: reviewEdges },
      },
    },
  } = response;

  return {
    reviewEdges,
  };
};

export const pullRequestHandle = async (octokit: GitHub): Promise<void> => {
  const { repository, pull_request: pullRequest } = context.payload;

  if (pullRequest === undefined || repository === undefined) {
    logWarning('Required pull request information is unavailable.');

    return;
  }

  if (pullRequest.user.login !== DEPENDABOT_GITHUB_LOGIN) {
    logInfo('Pull request was not created by Dependabot, skipping.');

    return;
  }

  try {
    const pullRequestInformation = await getPullRequestInformation(octokit, {
      pullRequestNumber: pullRequest.number,
      repositoryName: repository.name,
      repositoryOwner: repository.owner.login,
    });

    if (pullRequestInformation === undefined) {
      logWarning('Unable to fetch pull request information.');
    } else {
      logInfo(
        `Found pull request information: ${JSON.stringify(
          pullRequestInformation,
        )}.`,
      );

      await octokit.graphql(
        mutationSelector(pullRequestInformation.reviewEdges[0]),
        {
          commitHeadline: pullRequest.title,
          pullRequestId: pullRequest.node_id,
        },
      );
    }
  } catch (error) {
    logError(error);
  }
};
