/* eslint-disable max-statements */
import { context, getOctokit } from '@actions/github';

import { findPullRequestInfoByNumber } from '../../graphql/queries';
import { FindPullRequestInfoByNumberResponse, PullRequestInformation } from '../../types';
import { logError, logInfo, logWarning } from '../../utilities/log';

const TWO = 2;

interface WorkflowRunInformation {
  event: string;
  pullRequestNumber: number;
  status: string;
}

const getWorkflowRunInformation = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    repositoryName: string;
    repositoryOwner: string;
    runId: number;
  },
): Promise<WorkflowRunInformation | undefined> => {
  try {
    const { data } = await octokit.request(
      'GET /repos/:owner/:repo/actions/runs/:run_id',
      {
        owner: query.repositoryOwner,
        repo: query.repositoryName,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        run_id: query.runId,
      },
    );

    const pullRequests = data.pull_requests as Array<{
      number: number;
    }>;

    if (pullRequests.length !== 1) {
      throw new Error('Expected exactly one pull request in the workflow run.');
    }

    return {
      event: data.event,
      pullRequestNumber: pullRequests[0].number,
      status: data.status,
    };
  } catch (error: unknown) {
    logError(error);

    return undefined;
  }
};

const getPullRequestInformation = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformation | undefined> => {
  const response = await octokit.graphql(findPullRequestInfoByNumber, query);

  if (response === null || response.repository.pullRequest === null) {
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

export const workflowRunHandle = async (
  octokit: ReturnType<typeof getOctokit>,
): Promise<void> => {
  logInfo(`context.payload: ${JSON.stringify(context.payload, null, TWO)}`);
  logInfo(`context.eventName: ${context.eventName}`);
  logInfo(`context.sha: ${context.sha}`);
  logInfo(`context.ref: ${context.ref}`);
  logInfo(`context.workflow: ${context.workflow}`);
  logInfo(`context.action: ${context.action}`);
  logInfo(`context.actor: ${context.actor}`);
  logInfo(`context.job: ${context.job}`);
  logInfo(`context.runNumber: ${context.runNumber.toString()}`);
  logInfo(`context.runId: ${context.runId.toString()}`);
  logInfo(`context.issue: ${JSON.stringify(context.issue, null, TWO)}`);
  logInfo(`context.repo: ${JSON.stringify(context.repo, null, TWO)}`);

  const workflowRunInformation = await getWorkflowRunInformation(octokit, {
    repositoryName: context.repo.repo,
    repositoryOwner: context.repo.owner,
    runId: context.runId,
  });

  if (workflowRunInformation === undefined) {
    logWarning('Unable to fetch pull request information.');

    return;
  }

  logInfo(
    `Found workflow run information: ${JSON.stringify(
      workflowRunInformation,
    )}.`,
  );

  // What about pull_request events?
  if (workflowRunInformation.event !== 'push' || workflowRunInformation.status !== 'success') {
    logInfo('Ignoring.');

    // Also return.
  }

  const pullRequestInformation = await getPullRequestInformation(octokit, {
    pullRequestNumber: workflowRunInformation.pullRequestNumber,
    repositoryName: context.repo.repo,
    repositoryOwner: context.repo.owner,
  });

  if (pullRequestInformation === undefined) {
    logWarning('Unable to fetch pull request information.');
  } else {
    logInfo(
      `Found pull request information: ${JSON.stringify(
        pullRequestInformation,
      )}.`,
    );
  }
};
