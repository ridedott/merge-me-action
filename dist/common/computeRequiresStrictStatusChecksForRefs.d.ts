import { BranchProtectionRule } from './listBranchProtectionRules';
/**
 * Returns an array of booleans indicating whether the provided pull requests
 * require their branches to be up to date before merging.
 */
export declare const computeRequiresStrictStatusChecksForRefs: (branchProtectionRules: BranchProtectionRule[], refs: string[]) => boolean[];
//# sourceMappingURL=computeRequiresStrictStatusChecksForRefs.d.ts.map