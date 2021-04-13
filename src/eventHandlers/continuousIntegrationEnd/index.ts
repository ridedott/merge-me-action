/* eslint-disable no-await-in-loop */

import { context, getOctokit } from '@actions/github';
import type { GraphQlQueryResponseData } from '@octokit/graphql';
import { isMatch } from 'micromatch';

import { delay } from '../../common/delay';
import { tryMerge } from '../../common/merge';
import { findPullRequestInfoByNumber } from '../../graphql/queries';
import {
  FindPullRequestInfoByNumberResponse,
  PullRequestInformationContinuousIntegrationEnd,
} from '../../types';
import { logInfo, logWarning } from '../../utilities/log';

const EXPONENTIAL_BACKOFF = 2;
const MINIMUM_WAIT_TIME = 1000;

const MERGEABLE_STATUS_UNKNOWN_ERROR = 'Mergeable state is not known yet.';

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

const getMergeablePullRequestInformation = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformationContinuousIntegrationEnd | undefined> => {
  const pullRequestInformation = await getPullRequestInformation(
    octokit,
    query,
  );

  if (pullRequestInformation === undefined) {
    return pullRequestInformation;
  }

  if (pullRequestInformation.mergeableState === 'UNKNOWN') {
    throw new Error(MERGEABLE_STATUS_UNKNOWN_ERROR);
  }

  return pullRequestInformation;
};

const getMergeablePullRequestInformationWithRetry = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
  retries: {
    count?: number;
    maximum: number;
  },
): Promise<PullRequestInformationContinuousIntegrationEnd | undefined> => {
  const retryCount = retries.count ?? 1;

  const nextRetryIn = retryCount ** EXPONENTIAL_BACKOFF * MINIMUM_WAIT_TIME;

  try {
    return await getMergeablePullRequestInformation(octokit, query);
  } catch (error: unknown) {
    if (retryCount < retries.maximum) {
      logInfo(
        `Retrying get pull request #${query.pullRequestNumber.toString()} information in ${nextRetryIn.toString()}...`,
      );

      await delay(nextRetryIn);

      return await getMergeablePullRequestInformationWithRetry(octokit, query, {
        ...retries,
        count: retryCount + 1,
      });
    }

    return Promise.reject(error);
  }
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

  const pullRequestsInformationPromises: Array<
    Promise<PullRequestInformationContinuousIntegrationEnd | undefined>
  > = [];

  for (const pullRequest of pullRequests) {
    pullRequestsInformationPromises.push(
      getMergeablePullRequestInformationWithRetry(
        octokit,
        {
          pullRequestNumber: pullRequest.number,
          repositoryName: context.repo.repo,
          repositoryOwner: context.repo.owner,
        },
        {
          maximum: maximumRetries,
        },
      ).catch((): undefined => undefined),
    );
  }

  const pullRequestsInformation = await Promise.all(
    pullRequestsInformationPromises,
  );

  for (const pullRequestInformation of pullRequestsInformation) {
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
