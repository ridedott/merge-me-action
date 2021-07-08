import { getOctokit } from '@actions/github';
import { PullRequestCommitNode } from '../types';
export declare const getPullRequestCommitsIterator: (octokit: ReturnType<typeof getOctokit>, query: {
    pullRequestNumber: number;
    repositoryName: string;
    repositoryOwner: string;
}) => AsyncGenerator<PullRequestCommitNode>;
//# sourceMappingURL=getPullRequestCommits.d.ts.map