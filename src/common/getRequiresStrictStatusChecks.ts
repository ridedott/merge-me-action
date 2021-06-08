import { getOctokit } from '@actions/github';
import { isMatch } from 'micromatch';

import {
  BranchProtectionRule,
  listBranchProtectionRules,
} from './listBranchProtectionRules';

/**
 * Returns an array of booleans indicating whether the provided pull requests
 * require their branches to be up to date before merging.
 */
export const getRequiresStrictStatusChecks = async (
  octokit: ReturnType<typeof getOctokit>,
  {
    repositoryName,
    repositoryOwner,
  }: {
    repositoryName: string;
    repositoryOwner: string;
  },
  // eslint-disable-next-line unicorn/prevent-abbreviations
  refs: string[],
): Promise<boolean[]> => {
  const branchProtectionRules = await listBranchProtectionRules(
    octokit,
    repositoryOwner,
    repositoryName,
  );

  // eslint-disable-next-line unicorn/prevent-abbreviations
  return refs.map((ref: string): boolean =>
    branchProtectionRules.some(
      ({
        pattern,
        requiresStrictStatusChecks,
      }: BranchProtectionRule): boolean =>
        isMatch(ref, pattern) && requiresStrictStatusChecks === true,
    ),
  );
};
