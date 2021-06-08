import { getOctokit } from '@actions/github';

import { getRequiresStrictStatusChecks } from './getRequiresStrictStatusChecks';
import * as listBranchProtectionRules from './listBranchProtectionRules';

/**
 * Test utilitites
 */
const octokit = getOctokit('SECRET_GITHUB_TOKEN');
const repositoryName = 'test-repository';
const repositoryOwner = 'test-owner';
const listBranchProtectionRulesSpy = jest
  .spyOn(listBranchProtectionRules, 'listBranchProtectionRules')
  .mockImplementation(jest.fn());

/**
 * Tests
 */
describe('getRequiresStrictStatusChecks', (): void => {
  it('returns false for all refs when no branch protection rules exist for the repository', async (): Promise<void> => {
    expect.assertions(1);

    listBranchProtectionRulesSpy.mockResolvedValue([]);

    const result = await getRequiresStrictStatusChecks(
      octokit,
      {
        repositoryName,
        repositoryOwner,
      },
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([false, false]);
  });

  it('returns false for all refs when none of the branch protection rule patterns match provided refs', async (): Promise<void> => {
    expect.assertions(1);

    listBranchProtectionRulesSpy.mockResolvedValue([
      {
        pattern: 'test1',
        requiresStrictStatusChecks: true,
      },
      {
        pattern: 'test2',
        requiresStrictStatusChecks: true,
      },
    ]);

    const result = await getRequiresStrictStatusChecks(
      octokit,
      {
        repositoryName,
        repositoryOwner,
      },
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([false, false]);
  });

  it('returns false for all refs when all matching branch protection rule patterns do not require strict status checks', async (): Promise<void> => {
    expect.assertions(1);

    listBranchProtectionRulesSpy.mockResolvedValue([
      {
        pattern: 'dev',
        requiresStrictStatusChecks: false,
      },
      {
        pattern: 'master',
        requiresStrictStatusChecks: false,
      },
    ]);

    const result = await getRequiresStrictStatusChecks(
      octokit,
      {
        repositoryName,
        repositoryOwner,
      },
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([false, false]);
  });

  it('returns true for refs when matching branch protection rules require strict status checks', async (): Promise<void> => {
    expect.assertions(1);

    listBranchProtectionRulesSpy.mockResolvedValue([
      {
        pattern: 'dev',
        requiresStrictStatusChecks: true,
      },
      {
        pattern: 'master',
        requiresStrictStatusChecks: false,
      },
    ]);

    const result = await getRequiresStrictStatusChecks(
      octokit,
      {
        repositoryName,
        repositoryOwner,
      },
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([false, true]);
  });
});
