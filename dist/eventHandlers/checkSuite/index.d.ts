import { getOctokit } from '@actions/github';
import { MergeStateStatus, PullRequestInformation } from '../../types';
export interface PullRequestInformationCheckSuite extends PullRequestInformation {
    commitMessageHeadline: string;
    mergeStateStatus: MergeStateStatus;
}
export declare const checkSuiteHandle: (octokit: ReturnType<typeof getOctokit>, gitHubLogin: string, maximumRetries: number) => Promise<void>;
//# sourceMappingURL=index.d.ts.map