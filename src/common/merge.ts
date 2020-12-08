import { getOctokit } from '@actions/github';

import {
  approveAndMergePullRequestMutation,
  mergePullRequestMutation,
} from '../graphql/mutations';
import {
  parseInputMergeMethod,
  parseInputMergePreset,
} from '../utilities/inputParsers';
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

export const mergeWithRetry = async (
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

export const shouldMerge = (prTitle: string): boolean => {
  const mergePreset = parseInputMergePreset();

  if (mergePreset === undefined) {
    return true;
  }

  return checkPullRequestTitleForMergePreset(prTitle, mergePreset);
};
