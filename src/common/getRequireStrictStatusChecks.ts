import { getOctokit } from '@actions/github';
import { GraphQlQueryResponseData } from '@octokit/graphql';
import { isMatch } from 'micromatch';

import { listBranchProtectionRules } from '../graphql/queries';
import { RepositoryBranchProtectionRule } from '../types';
import { logInfo } from '../utilities/log';
import { IterableList, makeGraphqlIterator } from './makeGraphqlIterator';

export const getRequiresStrictStatusChecks = async (
  octokit: ReturnType<typeof getOctokit>,
  {
    repositoryName,
    repositoryOwner,
  }: {
    repositoryName: string;
    repositoryOwner: string;
  },
  headReferences: string[],
): Promise<boolean> => {
  const iterator = makeGraphqlIterator<RepositoryBranchProtectionRule>(
    octokit,
    {
      extractListFunction: (
        response: GraphQlQueryResponseData,
      ): IterableList<RepositoryBranchProtectionRule> =>
        response.repository.branchProtectionRules,
      parameters: {
        pageSize: 100,
        repositoryName,
        repositoryOwner,
      },
      query: listBranchProtectionRules,
    },
  );

  const firstResult: IteratorResult<RepositoryBranchProtectionRule> = await iterator.next();

  if (firstResult.done === true) {
    logInfo('Repository has no branch protection rules setup.');

    return false;
  }

  for await (const branchProtectionRuleNode of iterator) {
    const { pattern, requiresStrictStatusChecks } = branchProtectionRuleNode;

    if (
      requiresStrictStatusChecks === true &&
      isMatch(pattern, headReferences)
    ) {
      logInfo('Base branch requires that head be up to date before merging.');

      return true;
    }
  }

  return false;
};
