/* eslint-disable no-await-in-loop */

import { setFailed } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { findPullRequestInfo as findPullRequestInformation } from '../../graphql/queries';
import {
  MergeableState,
  MergeStateStatus,
  PullRequestInformation,
  PullRequestState,
  ReviewEdges,
} from '../../types';
import { mutationSelector } from '../../utilities/graphql';
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
    };
  };
}

export interface PullRequestInformationCheckSuite
  extends PullRequestInformation {
  commitMessageHeadline: string;
  mergeStateStatus: MergeStateStatus;
}

const getPullRequestInformation = async (
  octokit: GitHub,
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
    reviewEdges,
  };
};

const tryMerge = async (
  octokit: GitHub,
  {
    commitMessageHeadline,
    mergeStateStatus,
    mergeableState,
    merged,
    pullRequestId,
    pullRequestState,
    reviewEdges,
  }: PullRequestInformationCheckSuite,
): Promise<void> => {
  if (mergeableState !== 'MERGEABLE') {
    logInfo(`Pull request is not in a mergeable state: ${mergeableState}.`);
  } else if (merged) {
    logInfo(`Pull request is already merged.`);
  } else if (
    mergeStateStatus !== 'CLEAN' &&
    /*
     * cspell:ignore merlinnot
     *
     * TODO(merlinnot) [2020-09-01] Start pulling the value once it reaches
     * GA.
     */
    mergeStateStatus !== undefined
  ) {
    logInfo(
      'Pull request cannot be merged cleanly. ' +
        `Current state: ${mergeStateStatus}.`,
    );
  } else if (pullRequestState !== 'OPEN') {
    logInfo(`Pull request is not open: ${pullRequestState}.`);
  } else {
    await octokit.graphql(mutationSelector(reviewEdges[0]), {
      commitHeadline: commitMessageHeadline,
      pullRequestId,
    });
  }
};

export const checkSuiteHandle = async (
  octokit: GitHub,
  gitHubLogin: string,
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

    try {
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

        await tryMerge(octokit, pullRequestInformation);
      }
    } catch (error) {
      setFailed(error);
    }
  }
};
