import { getOctokit } from '@actions/github';
import { GraphQlQueryResponseData } from '@octokit/graphql';

import { PullRequestCommitNode } from '../types';
import { IterableList, makeGraphqlIterator } from './makeGraphqlIterator';

const findPullRequestCommitsQuery = `
  query FindPullRequestsInfoByReferenceName($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!, $pageSize: Int!, $endCursor: String) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequest(number: $pullRequestNumber) {
        commits(first: $pageSize, after: $endCursor) {
          edges {
            node {
              commit {
                author {
                  user {
                    login
                  }
                }
                signature {
                  isValid
                }
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

export const getPullRequestCommitsIterator = (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): AsyncGenerator<PullRequestCommitNode> =>
  makeGraphqlIterator<PullRequestCommitNode>(octokit, {
    extractListFunction: (
      response: GraphQlQueryResponseData,
    ): IterableList<PullRequestCommitNode> =>
      response.repository.pullRequest?.commits,
    parameters: query,
    query: findPullRequestCommitsQuery,
  });
