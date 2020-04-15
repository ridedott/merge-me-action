import { GitHub } from '@actions/github';
import { MergeStateStatus, PullRequestInformation } from '../../types';
export interface PullRequestInformationCheckSuite extends PullRequestInformation {
    commitMessageHeadline: string;
    mergeStateStatus: MergeStateStatus;
}
export declare const checkSuiteHandle: (octokit: GitHub, gitHubLogin: string) => Promise<void>;
//# sourceMappingURL=index.d.ts.map