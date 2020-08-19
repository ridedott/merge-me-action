import { context, getOctokit } from '@actions/github';

import { mergeWithRetry } from '../../common/merge';
import { findPullRequestLastApprovedReview } from '../../graphql/queries';
import { ReviewEdges } from '../../types';
import { logInfo, logWarning } from '../../utilities/log';

interface PullRequestInformation {
  reviewEdges: ReviewEdges;
}

interface Repository {
  repository: {
    pullRequest: {
      reviews: {
        edges: ReviewEdges;
      };
    };
  };
}

const getPullRequestInformation = async (
  octokit: ReturnType<typeof getOctokit>,
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
  } = response as Repository;

  return {
    reviewEdges,
  };
};

export const pullRequestHandle = async (
  octokit: ReturnType<typeof getOctokit>,
  gitHubLogin: string,
  maximumRetries: number,
): Promise<void> => {
  /* eslint-disable @typescript-eslint/naming-convention */
  const { repository, pull_request: pullRequest } = context.payload;
  /* eslint-enable @typescript-eslint/naming-convention */

  if (pullRequest === undefined || repository === undefined) {
    logWarning('Required pull request information is unavailable.');

    return;
  }

  if (pullRequest.user.login !== gitHubLogin) {
    logInfo(
      `Pull request created by ${
        pullRequest.user.login as string
      }, not ${gitHubLogin}, skipping.`,
    );

    return;
  }

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

    await mergeWithRetry(octokit, {
      commitHeadline: pullRequest.title,
      maximumRetries,
      pullRequestId: pullRequest.node_id,
      retryCount: 1,
      reviewEdge: pullRequestInformation.reviewEdges[0],
    });
  }
};
