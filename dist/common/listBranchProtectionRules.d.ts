import { getOctokit } from '@actions/github';
export interface BranchProtectionRule {
    pattern: string;
    requiresStrictStatusChecks: boolean;
}
/**
 * Returns an array containing a repository's configured partial branch
 * protection rules.
 */
export declare const listBranchProtectionRules: (octokit: ReturnType<typeof getOctokit>, repositoryOwner: string, repositoryName: string) => Promise<BranchProtectionRule[]>;
//# sourceMappingURL=listBranchProtectionRules.d.ts.map