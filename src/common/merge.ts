import { getInput } from '@actions/core';
import { getOctokit } from '@actions/github';

import {
  approveAndMergePullRequestMutation,
  mergePullRequestMutation,
} from '../graphql/mutations';
import { PullRequestInformationContinuousIntegrationEnd } from '../types';
import { parseInputMergeMethod } from '../utilities/inputParsers';
import { logDebug, logInfo } from '../utilities/log';
import { checkPullRequestTitleForMergePreset } from '../utilities/prTitleParsers';

export interface PullRequestDetails {
  commitHeadline: string;
  pullRequestId: string;
  reviewEdge: { node: { state: string } } | undefined;
}

const EXPONENTIAL_BACKOFF = 2;
const MINIMUM_WAIT_TIME = 1000;

const delay = async (duration: number): Promise<void> => {
  return new Promise((resolve: () => void): void => {
    setTimeout((): void => {
      resolve();
    }, duration);
  });
};

/**
 * Approves and merges a given Pull Request.
 */
const merge = async (
  octokit: ReturnType<typeof getOctokit>,
  pullRequestDetails: PullRequestDetails,
): Promise<void> => {
  const mergeMethod = parseInputMergeMethod();

  const { commitHeadline, pullRequestId, reviewEdge } = pullRequestDetails;

  const mutation =
    reviewEdge === undefined
      ? approveAndMergePullRequestMutation(mergeMethod)
      : mergePullRequestMutation(mergeMethod);

  await octokit.graphql(mutation, { commitHeadline, pullRequestId });
};

const shouldRetry = (
  error: Error,
  retryCount: number,
  maximumRetries: number,
): boolean => {
  const isRetryableError = error.message.includes('Base branch was modified.');

  if (isRetryableError && retryCount > maximumRetries) {
    logInfo(
      `Unable to merge after ${retryCount.toString()} attempts. Retries exhausted.`,
    );

    return false;
  }

  return isRetryableError;
};

const mergeWithRetry = async (
  octokit: ReturnType<typeof getOctokit>,
  details: PullRequestDetails & {
    maximumRetries: number;
    retryCount: number;
  },
): Promise<void> => {
  const { retryCount, maximumRetries } = details;

  try {
    await merge(octokit, details);
  } catch (error: unknown) {
    if (shouldRetry(error as Error, retryCount, maximumRetries)) {
      const nextRetryIn = retryCount ** EXPONENTIAL_BACKOFF * MINIMUM_WAIT_TIME;

      logInfo(`Retrying in ${nextRetryIn.toString()}...`);

      await delay(nextRetryIn);

      await mergeWithRetry(octokit, {
        ...details,
        maximumRetries,
        retryCount: retryCount + 1,
      });

      return;
    }

    logInfo(
      'An error ocurred while merging the Pull Request. This is usually ' +
        'caused by the base branch being out of sync with the target ' +
        'branch. In this case, the base branch must be rebased. Some ' +
        'tools, such as Dependabot, do that automatically.',
    );
    /* eslint-disable-next-line @typescript-eslint/no-base-to-string */
    logDebug(`Original error: ${(error as Error).toString()}.`);
  }
};

export const tryMerge = async (
  octokit: ReturnType<typeof getOctokit>,
  maximumRetries: number,
  {
    commitAuthorName,
    commitMessageHeadline,
    mergeableState,
    mergeStateStatus,
    merged,
    pullRequestId,
    pullRequestState,
    pullRequestTitle,
    reviewEdges,
  }: PullRequestInformationContinuousIntegrationEnd,
): Promise<void> => {
  const allowedAuthorName = getInput('GITHUB_LOGIN');
  const disabledForManualChanges =
    getInput('DISABLED_FOR_MANUAL_CHANGES') === 'true';

  if (mergeableState !== 'MERGEABLE') {
    logInfo(`Pull request is not in a mergeable state: ${mergeableState}.`);
  } else if (merged) {
    logInfo(`Pull request is already merged.`);
  } else if (
    /*
     * TODO(@platform) [2021-04-01] Start pulling the value once it reaches
     * GA.
     */
    mergeStateStatus !== undefined &&
    mergeStateStatus !== 'CLEAN'
  ) {
    logInfo(
      'Pull request cannot be merged cleanly. ' +
        `Current state: ${mergeStateStatus}.`,
    );
  } else if (pullRequestState !== 'OPEN') {
    logInfo(`Pull request is not open: ${pullRequestState}.`);
  } else if (checkPullRequestTitleForMergePreset(pullRequestTitle) === false) {
    logInfo(`Pull request version bump is not allowed by PRESET.`);
  } else if (
    commitAuthorName !== allowedAuthorName &&
    disabledForManualChanges === true
  ) {
    logInfo(`Pull request changes were not made by ${allowedAuthorName}.`);
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
