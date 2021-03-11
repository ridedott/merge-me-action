import { getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import { tryMerge } from '../../common/merge';
import {
  getLastWorkflowRunConclusion,
  WorkflowRunConclusion,
} from '../../common/workflowRun';
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
        headRefName: pullRequestBranch,
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
    pullRequestBranch,
    pullRequestId,
    pullRequestState,
    pullRequestTitle,
    reviewEdges,
  };
};

const DEPENDS_ON = getInput('DEPENDS_ON');

// eslint-disable-next-line max-statements,max-lines-per-function
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

  const pullRequestInformation = await getPullRequestInformation(octokit, {
    pullRequestNumber: pullRequest.number,
    repositoryName: repository.name,
    repositoryOwner: repository.owner.login,
  });

  if (pullRequestInformation === undefined) {
    logWarning('Unable to fetch pull request information.');
  } else {
    if (DEPENDS_ON.length > 0) {
      logInfo(
        `Depends on: ${DEPENDS_ON}, context ref is: ${pullRequestInformation.pullRequestBranch}, sha: ${context.sha}, event: ${context.eventName}, owner: ${context.repo.owner}, repo: ${context.repo.repo}`,
      );

      const conclusion = await getLastWorkflowRunConclusion(octokit, {
        branch: pullRequestInformation.pullRequestBranch,
        event: context.eventName,
        owner: context.repo.owner,
        repository: context.repo.repo,
        sha: context.sha,
        workflowId: DEPENDS_ON,
      });

      if (conclusion !== WorkflowRunConclusion.Success) {
        logInfo(
          `The last run of ${DEPENDS_ON} workflow is expected to be 'success' but it is '${
            conclusion ?? 'unknown'
          }', skipping.`,
        );

        return;
      }

      logInfo(`The last run of ${DEPENDS_ON} workflow is '${conclusion}'.`);
    }

    if (pullRequest.user.login !== gitHubLogin) {
      logInfo(
        `Pull request created by ${
          pullRequest.user.login as string
        }, not ${gitHubLogin}, skipping.`,
      );

      return;
    }

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
