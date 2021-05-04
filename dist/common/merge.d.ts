import { getOctokit } from '@actions/github';
import { PullRequestInformation } from '../types';
export interface PullRequestDetails {
    commitHeadline: string;
    pullRequestId: string;
    reviewEdge: {
        node: {
            state: string;
        };
    } | undefined;
}
export declare const tryMerge: (octokit: ReturnType<typeof getOctokit>, maximumRetries: number, { commitMessageHeadline, mergeableState, mergeStateStatus, merged, pullRequestId, pullRequestNumber, pullRequestState, pullRequestTitle, reviewEdges, repositoryName, repositoryOwner, }: PullRequestInformation) => Promise<void>;
//# sourceMappingURL=merge.d.ts.map