import { getOctokit } from '@actions/github';
import type { GraphQlQueryResponseData } from '@octokit/graphql';

import {
  FindPullRequestInfoByNumberResponse,
  PullRequestInformation,
} from '../types';

const MERGEABLE_STATUS_UNKNOWN_ERROR = 'Mergeable state is not known yet.';

const pullRequestFields = `{
  author {
    login
  }
  commits(last: 1) {
    edges {
      node {
        commit {
          author {
            name
          }
          messageHeadline
          message
        }
      }
    }
  }
  id
  mergeable
  merged
  number
  reviews(last: 1, states: APPROVED) {
    edges {
      node {
        state
      }
    }
  }
  state
  title
}`;

const findPullRequestInfoByNumberQuery = `
  query FindPullRequestInfoByNumber(
    $repositoryOwner: String!,
    $repositoryName: String!,
    $pullRequestNumber: Int!
  ) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequest(number: $pullRequestNumber) ${pullRequestFields}
    }
  }
`;

const getPullRequestInformationByPullRequestNumber = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformation | undefined> => {
  const response = await octokit.graphql<GraphQlQueryResponseData | null>(
    findPullRequestInfoByNumberQuery,
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
