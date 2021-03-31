/* eslint-disable max-statements */
import { context, getOctokit } from '@actions/github';

import { findPullRequestInfoByNumber } from '../../graphql/queries';
import { FindPullRequestInfoByNumberResponse, PullRequestInformation } from '../../types';
import { logError, logInfo, logWarning } from '../../utilities/log';

const TWO = 2;

interface WorkflowRunPayload {
  conclusion: string;
  event: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pull_requests: Array<{ number: number }>;
  status: string;
}

interface WorkflowRunInformation {
  conclusion: string;
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
      conclusion: data.conclusion,
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

const extractWorkflowRunInformation = (
  payload: typeof context['payload'],
): WorkflowRunInformation | undefined => {
  if (
    payload.workflow_run === undefined ||
    Array.isArray(payload.workflow_run.pull_requests) === false
  ) {
    logWarning(new Error('Incorrect workflow_run information.'));

    return;
  }

  const {
    conclusion,
    event,
    pull_requests: pullRequests,
    status,
  } = payload.workflow_run as WorkflowRunPayload;

  if (pullRequests.length !== 1) {
    logWarning(
      new Error('Expected exactly one pull request in the workflow run.'),
    );

    return;
  }

  return {
    conclusion,
    event,
    pullRequestNumber: pullRequests[0].number,
    status,
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

  const workflowRunInformation1 = await getWorkflowRunInformation(octokit, {
    repositoryName: context.repo.repo,
    repositoryOwner: context.repo.owner,
    runId: context.runId,
  });

  logInfo(
    `Found workflow run information 1: ${JSON.stringify(
      workflowRunInformation1,
    )}.`,
  );

  const workflowRunInformation = extractWorkflowRunInformation(context.payload);

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
  if (
    workflowRunInformation.event !== 'push' ||
    workflowRunInformation.status !== 'completed' ||
    workflowRunInformation.conclusion !== 'success'
  ) {
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
