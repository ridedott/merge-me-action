import { getOctokit } from '@actions/github';
import { PullRequestInformation } from '../types';
export declare const getMergeablePullRequestInformationByPullRequestNumber: (octokit: ReturnType<typeof getOctokit>, query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
}, options: {
    githubPreviewApiEnabled: boolean;
}) => Promise<PullRequestInformation | undefined>;
//# sourceMappingURL=getPullRequestInformation.d.ts.map