import { getOctokit } from '@actions/github';
import { PullRequestInformationContinuousIntegrationEnd } from '../types';
export interface PullRequestDetails {
    commitHeadline: string;
    pullRequestId: string;
    reviewEdge: {
        node: {
            state: string;
        };
    } | undefined;
}
export declare const tryMerge: (octokit: ReturnType<typeof getOctokit>, maximumRetries: number, { commitAuthorName, commitMessageHeadline, mergeableState, mergeStateStatus, merged, pullRequestId, pullRequestState, pullRequestTitle, reviewEdges, }: PullRequestInformationContinuousIntegrationEnd) => Promise<void>;
//# sourceMappingURL=merge.d.ts.map