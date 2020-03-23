/* eslint-disable no-await-in-loop */

import { context, GitHub } from '@actions/github';

import { findPullRequestInfo as findPullRequestInformation } from '../../graphql/queries';
import { mutationSelector } from '../../utilities/graphql';
import { logError, logInfo, logWarning } from '../../utilities/log';

interface PullRequestInformation {
  commitMessageHeadline: string;
  mergeableState: 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';
  merged: boolean;
  mergeStateStatus:
    | 'BEHIND'
    | 'BLOCKED'
    | 'CLEAN'
    | 'DIRTY'
    | 'DRAFT'
    | 'HAS_HOOKS'
    | 'UNKNOWN'
    | 'UNSTABLE';
  pullRequestId: string;
  pullRequestState: 'CLOSED' | 'MERGED' | 'OPEN';
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
  } = response;

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
  }: PullRequestInformation,
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
     * TODO(merlinnot) [2020-05-01] Start pulling the value once it reaches
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
  const pullRequests = context.payload.check_suite.pull_requests;

  for (const pullRequest of pullRequests) {
    if (
      typeof context.payload.sender !== 'object' ||
      context.payload.sender.login !== gitHubLogin
    ) {
      logInfo(`Pull request not created by ${gitHubLogin}, skipping.`);

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
      logError(error);
    }
  }
};
