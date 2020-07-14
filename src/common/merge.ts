import { getOctokit } from '@actions/github';

import {
  approveAndMergePullRequestMutation,
  mergePullRequestMutation,
} from '../graphql/mutations';
import { parseInputMergeMethod } from '../utilities/inputParsers';
import { logDebug, logInfo } from '../utilities/log';

/**
 * Approves and merges a given Pull Request.
 */
export const merge = async (
  octokit: ReturnType<typeof getOctokit>,
  {
    commitHeadline,
    pullRequestId,
    reviewEdge,
  }: {
    commitHeadline: string;
    pullRequestId: string;
    reviewEdge: { node: { state: string } } | undefined;
  },
): Promise<void> => {
  const mergeMethod = parseInputMergeMethod();

  const mutation =
    reviewEdge === undefined
      ? approveAndMergePullRequestMutation(mergeMethod)
      : mergePullRequestMutation(mergeMethod);

  try {
    await octokit.graphql(mutation, { commitHeadline, pullRequestId });
  } catch (error) {
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
