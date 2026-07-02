import { computeRequiresStatusChecksForReferences } from './computeRequiresStatusChecksForReferences';

/**
 * Tests
 */
describe('computeRequiresStrictStatusChecksForRefs', (): void => {
  it('returns false for all refs when no branch protection rules exist for the repository', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [],
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
    ]);
  });

  it('returns false for all refs when none of the branch protection rule patterns match provided refs', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [
        {
          pattern: 'test1',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: true,
        },
        {
          pattern: 'test2',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: true,
        },
      ],
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
    ]);
  });

  it('returns false for all refs when all matching branch protection rule patterns do not require strict status checks', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [
        {
          pattern: 'dev',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: false,
        },
        {
          pattern: 'master',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: false,
        },
      ],
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
    ]);
  });

  it('returns true for all refs when branch protection rule patterns match provided refs with wildcard', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [
        {
          pattern: 'test*',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: true,
        },
      ],
      ['test', 'testing', 'master'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: false, requiresStrictStatusChecks: true },
      { requiresStatusChecks: false, requiresStrictStatusChecks: true },
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
    ]);
  });

  it('returns true for refs when matching branch protection rules require strict status checks', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [
        {
          pattern: 'dev',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: true,
        },
        {
          pattern: 'master',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: false,
        },
      ],
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
      { requiresStatusChecks: false, requiresStrictStatusChecks: true },
    ]);
  });

  it('returns true for refs when matching branch protection rules require status checks (but not strict)', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [
        {
          pattern: 'dev',
          requiresStatusChecks: true,
          requiresStrictStatusChecks: false,
        },
        {
          pattern: 'master',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: false,
        },
      ],
      ['master', 'dev'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
      { requiresStatusChecks: true, requiresStrictStatusChecks: false },
    ]);
  });

  it('returns true for refs when EITHER requiresStatusChecks OR requiresStrictStatusChecks is true', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [
        {
          pattern: 'dev',
          requiresStatusChecks: true,
          requiresStrictStatusChecks: false,
        },
        {
          pattern: 'master',
          requiresStatusChecks: false,
          requiresStrictStatusChecks: true,
        },
        {
          pattern: 'staging',
          requiresStatusChecks: true,
          requiresStrictStatusChecks: true,
        },
      ],
      ['master', 'dev', 'staging'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: false, requiresStrictStatusChecks: true },
      { requiresStatusChecks: true, requiresStrictStatusChecks: false },
      { requiresStatusChecks: true, requiresStrictStatusChecks: true },
    ]);
  });

  it('returns true for refs matching wildcard pattern when requiresStatusChecks is true', (): void => {
    expect.assertions(1);

    const result = computeRequiresStatusChecksForReferences(
      [
        {
          pattern: 'feature/*',
          requiresStatusChecks: true,
          requiresStrictStatusChecks: false,
        },
      ],
      ['feature/auth', 'feature/payments', 'main'],
    );

    expect(result).toStrictEqual([
      { requiresStatusChecks: true, requiresStrictStatusChecks: false },
      { requiresStatusChecks: true, requiresStrictStatusChecks: false },
      { requiresStatusChecks: false, requiresStrictStatusChecks: false },
    ]);
  });
});
