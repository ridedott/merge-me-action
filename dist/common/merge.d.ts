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
export declare const tryMerge: (octokit: ReturnType<typeof getOctokit>, maximumRetries: number, { commitMessageHeadline, mergeableState, mergeStateStatus, merged, pullRequestId, pullRequestNumber, pullRequestState, pullRequestTitle, reviewEdges, repositoryName, repositoryOwner, }: PullRequestInformationContinuousIntegrationEnd) => Promise<void>;
//# sourceMappingURL=merge.d.ts.map