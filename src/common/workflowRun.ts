import { getOctokit } from '@actions/github';

import { logInfo } from '../utilities/log';

const HTTP_OK = 200;

export enum WorkflowRunConclusion {
  ActionRequired = 'action_required',
  Cancelled = 'cancelled',
  Failure = 'failure',
  Neutral = 'neutral',
  Success = 'success',
  Skipped = 'skipped',
  Stale = 'stale',
  TimedOut = 'timed_out',
}

export const getLastWorkflowRunConclusion = async (
  octokit: ReturnType<typeof getOctokit>,
  query: {
    branch: string;
    event: string;
    owner: string;
    repository: string;
    sha: string;
    workflowId: string | number;
  },
): Promise<WorkflowRunConclusion | undefined> => {
  const response = await octokit.actions.listWorkflowRuns({
    branch: query.branch,
    owner: query.owner,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    per_page: 100,
    repo: query.repository,
    status: 'completed',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    workflow_id: (query.workflowId as unknown) as number,
  });

  if (response.status !== HTTP_OK) {
    return;
  }

  logInfo(response.data.workflow_runs);

  const runsForCommit = response.data.workflow_runs.filter(
    (run): boolean => run.head_sha === query.sha,
  );

  if (runsForCommit.length === 0) {
    return;
  }

  const [workflowRun] = runsForCommit;

  return workflowRun.conclusion as WorkflowRunConclusion;
};
