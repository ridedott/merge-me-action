import { getOctokit } from '@actions/github';
export interface PullRequestDetails {
    commitHeadline: string;
    pullRequestId: string;
    reviewEdge: {
        node: {
            state: string;
        };
    } | undefined;
}
export declare const mergeWithRetry: (octokit: ReturnType<typeof getOctokit>, details: PullRequestDetails & {
    maximumRetries: number;
    retryCount: number;
}) => Promise<void>;
//# sourceMappingURL=merge.d.ts.map