import { getOctokit } from '@actions/github';
export declare enum WorkflowRunConclusion {
    ActionRequired = "action_required",
    Cancelled = "cancelled",
    Failure = "failure",
    Neutral = "neutral",
    Success = "success",
    Skipped = "skipped",
    Stale = "stale",
    TimedOut = "timed_out"
}
export declare const getLastWorkflowRunConclusion: (octokit: ReturnType<typeof getOctokit>, query: {
    branch: string;
    event: string;
    owner: string;
    repository: string;
    sha: string;
    workflowFileName: string;
}) => Promise<WorkflowRunConclusion | undefined>;
//# sourceMappingURL=workflowRun.d.ts.map