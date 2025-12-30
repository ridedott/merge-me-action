import { isMatch } from 'micromatch';

import { BranchProtectionRule } from './listBranchProtectionRules';

export interface StatusCheckRequirements {
  requiresStatusChecks: boolean;
  requiresStrictStatusChecks: boolean;
}

/**
 * Returns an array of objects indicating what status check requirements
 * the provided pull request references have before merging.
 */
export const computeRequiresStatusChecksForReferences = (
  branchProtectionRules: BranchProtectionRule[],
  references: string[],
): StatusCheckRequirements[] =>
  references.map((reference: string): StatusCheckRequirements => {
    const matchingRules = branchProtectionRules.filter(
      ({ pattern }: BranchProtectionRule): boolean =>
        isMatch(reference, pattern),
    );

    return {
      requiresStatusChecks: matchingRules.some(
        (rule: BranchProtectionRule): boolean =>
          rule.requiresStatusChecks === true,
      ),
      requiresStrictStatusChecks: matchingRules.some(
        (rule: BranchProtectionRule): boolean =>
          rule.requiresStrictStatusChecks === true,
      ),
    };
  });
