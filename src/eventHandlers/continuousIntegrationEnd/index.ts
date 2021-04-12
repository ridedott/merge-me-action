/* eslint-disable no-await-in-loop */

import { context, getOctokit } from '@actions/github';
import type { GraphQlQueryResponseData } from '@octokit/graphql';
import { isMatch } from 'micromatch';

import { tryMerge } from '../../common/merge';
import { findPullRequestInfoByNumber } from '../../graphql/queries';
import {
  FindPullRequestInfoByNumberResponse,
  PullRequestInformationContinuousIntegrationEnd,
} from '../../types';
import { logInfo, logWarning } from '../../utilities/log';

const getPullRequestInformation = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformationContinuousIntegrationEnd | undefined> => {
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

export const continuousIntegrationEndHandle = async (
  octokit: ReturnType<typeof getOctokit>,
  gitHubLogin: string,
  maximumRetries: number,
): Promise<void> => {
  const pullRequests = (context.eventName === 'workflow_run'
    ? context.payload.workflow_run
    : context.payload.check_suite
  ).pull_requests as Array<{
    number: number;
  }>;

  for (const pullRequest of pullRequests) {
    const pullRequestInformation = await getPullRequestInformation(octokit, {
      pullRequestNumber: pullRequest.number,
      repositoryName: context.repo.repo,
      repositoryOwner: context.repo.owner,
    });

    if (pullRequestInformation === undefined) {
      logWarning('Unable to fetch pull request information.');
    } else {
      if (isMatch(pullRequestInformation.authorLogin, gitHubLogin) === false) {
        logInfo(
          `Pull request created by ${pullRequestInformation.authorLogin}, not ${gitHubLogin}, skipping.`,
        );

        return;
      }

      logInfo(
        `Found pull request information: ${JSON.stringify(
          pullRequestInformation,
        )}.`,
      );

      await tryMerge(octokit, maximumRetries, pullRequestInformation);
    }
  }
};
