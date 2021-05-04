import { getOctokit } from '@actions/github';
import type { GraphQlQueryResponseData } from '@octokit/graphql';

import { findPullRequestInfoByNumber } from '../graphql/queries';
import {
  FindPullRequestInfoByNumberResponse,
  PullRequestInformation,
} from '../types';

const MERGEABLE_STATUS_UNKNOWN_ERROR = 'Mergeable state is not known yet.';

const getPullRequestInformationByPullRequestNumber = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformation | undefined> => {
  const response = await octokit.graphql<GraphQlQueryResponseData | null>(
    findPullRequestInfoByNumber,
    query,
  );

  if (response === null || response.repository.pullRequest === null) {
    return undefined;
  }

  const {
    repository: {
      pullRequest: {
        author: { login: authorLogin },
        id: pullRequestId,
        commits: {
          edges: [
            {
              node: {
                commit: {
                  message: commitMessage,
                  messageHeadline: commitMessageHeadline,
                },
              },
            },
          ],
        },
        number: pullRequestNumber,
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
    authorLogin,
    commitMessage,
    commitMessageHeadline,
    mergeStateStatus,
    mergeableState,
    merged,
    pullRequestId,
    pullRequestNumber,
    pullRequestState,
    pullRequestTitle,
    repositoryName: query.repositoryName,
    repositoryOwner: query.repositoryOwner,
    reviewEdges,
  };
};

export const getMergeablePullRequestInformationByPullRequestNumber = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformation | undefined> => {
  const pullRequestInformation = await getPullRequestInformationByPullRequestNumber(
    octokit,
    query,
  );

  if (pullRequestInformation === undefined) {
    return undefined;
  }

  if (pullRequestInformation.mergeableState === 'UNKNOWN') {
    throw new Error(MERGEABLE_STATUS_UNKNOWN_ERROR);
  }

  return pullRequestInformation;
};
