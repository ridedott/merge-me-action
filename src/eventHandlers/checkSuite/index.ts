/* eslint-disable no-await-in-loop */

import { context, getOctokit } from '@actions/github';

import { mergeWithRetry, shouldMerge } from '../../common/merge';
import { findPullRequestInfo as findPullRequestInformation } from '../../graphql/queries';
import {
  MergeableState,
  MergeStateStatus,
  PullRequestInformation,
  PullRequestState,
  ReviewEdges,
} from '../../types';
import { logInfo, logWarning } from '../../utilities/log';

interface Repository {
  repository: {
    id: string;
    pullRequest: {
      commits: {
        edges: Array<{
          node: {
            commit: {
              messageHeadline: string;
            };
          };
        }>;
      };
      id: string;
      mergeStateStatus: MergeStateStatus;
      mergeable: MergeableState;
      merged: boolean;
      reviews: { edges: ReviewEdges };
      state: PullRequestState;
      title: string;
    };
  };
}

export interface PullRequestInformationCheckSuite
  extends PullRequestInformation {
  commitMessageHeadline: string;
  mergeStateStatus: MergeStateStatus;
}

const getPullRequestInformation = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformationCheckSuite | undefined> => {
  const response = await octokit.graphql(findPullRequestInformation, query);

  if (response === null || response.repository.pullRequest === null) {
    return undefined;
  }

  const {
    repository: {
      pullRequest: {
        id: pullRequestId,
        commits: {
          edges: [
            {
              node: {
                commit: { messageHeadline: commitMessageHeadline },
              },
            },
          ],
        },
        reviews: { edges: reviewEdges },
        mergeStateStatus,
        mergeable: mergeableState,
        merged,
        state: pullRequestState,
        title: pullRequestTitle,
      },
    },
  } = response as Repository;

  return {
    commitMessageHeadline,
    mergeStateStatus,
    mergeableState,
    merged,
    pullRequestId,
    pullRequestState,
    pullRequestTitle,
    reviewEdges,
  };
};

const tryMerge = async (
  octokit: ReturnType<typeof getOctokit>,
  maximumRetries: number,
  {
    commitMessageHeadline,
    mergeStateStatus,
    mergeableState,
    merged,
    pullRequestId,
    pullRequestState,
    pullRequestTitle,
    reviewEdges,
  }: PullRequestInformationCheckSuite,
): Promise<void> => {
  if (mergeableState !== 'MERGEABLE') {
    logInfo(`Pull request is not in a mergeable state: ${mergeableState}.`);
  } else if (merged) {
    logInfo(`Pull request is already merged.`);
  } else if (
    mergeStateStatus !== 'CLEAN' &&
    /* eslint-disable @typescript-eslint/no-unnecessary-condition */
    /*
     * cspell:ignore merlinnot
     *
     * TODO(merlinnot) [2021-04-01] Start pulling the value once it reaches
     * GA.
     */
    mergeStateStatus !== undefined
    /* eslint-enable @typescript-eslint/no-unnecessary-condition */
  ) {
    logInfo(
      'Pull request cannot be merged cleanly. ' +
        `Current state: ${mergeStateStatus}.`,
    );
  } else if (pullRequestState !== 'OPEN') {
    logInfo(`Pull request is not open: ${pullRequestState}.`);
  } else if (shouldMerge(pullRequestTitle) === false) {
    logInfo(`Pull request version bump is not allowed by PRESET.`);
  } else {
    await mergeWithRetry(octokit, {
      commitHeadline: commitMessageHeadline,
      maximumRetries,
      pullRequestId,
      retryCount: 1,
      reviewEdge: reviewEdges[0],
    });
  }
};

export const checkSuiteHandle = async (
  octokit: ReturnType<typeof getOctokit>,
  gitHubLogin: string,
  maximumRetries: number,
): Promise<void> => {
  const pullRequests = context.payload.check_suite.pull_requests as Array<{
    number: number;
  }>;

  for (const pullRequest of pullRequests) {
    if (
      typeof context.payload.sender !== 'object' ||
      context.payload.sender.login !== gitHubLogin
    ) {
      logInfo(
        `Pull request created by ${
          (context.payload.sender?.login as string | undefined) ??
          'unknown sender'
        }, not ${gitHubLogin}, skipping.`,
      );

      return;
    }

    const pullRequestInformation = await getPullRequestInformation(octokit, {
      pullRequestNumber: pullRequest.number,
      repositoryName: context.repo.repo,
      repositoryOwner: context.repo.owner,
    });

    if (pullRequestInformation === undefined) {
      logWarning('Unable to fetch pull request information.');
    } else {
      logInfo(
        `Found pull request information: ${JSON.stringify(
          pullRequestInformation,
        )}.`,
      );

      await tryMerge(octokit, maximumRetries, pullRequestInformation);
    }
  }
};
