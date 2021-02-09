import { context, getOctokit } from '@actions/github';

import { tryMerge } from '../../common/merge';
import { findPullRequestInfoByNumber } from '../../graphql/queries';
import {
  FindPullRequestInfoByNumberResponse,
  PullRequestInformation,
} from '../../types';
import { logInfo, logWarning } from '../../utilities/log';

const getPullRequestInformation = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformation | undefined> => {
  const response = await octokit.graphql(findPullRequestInfoByNumber, query);

  if (response === null) {
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
                commit: {
                  author: { name: commitAuthorName },
                  message: commitMessage,
                  messageHeadline: commitMessageHeadline,
                },
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
  } = response as FindPullRequestInfoByNumberResponse;

  return {
    commitAuthorName,
    commitMessage,
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

export const pullRequestHandle = async (
  octokit: ReturnType<typeof getOctokit>,
  gitHubLogin: string,
  maximumRetries: number,
): Promise<void> => {
  const { repository, pull_request: pullRequest } = context.payload;

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

    await tryMerge(octokit, maximumRetries, {
      ...pullRequestInformation,
      commitMessageHeadline: pullRequest.title,
    });
  }
};
