/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { AllowedMergeMethods } from '../src/utilities/inputParsers';

export const useSetTimeoutImmediateInvocation = (): jest.SpyInstance<
  NodeJS.Timeout,
  [
    callback: (...arguments_: unknown[]) => void,
    ms?: number | undefined,
    ...arguments_: unknown[],
  ]
> =>
  jest
    .spyOn(global, 'setTimeout')
    .mockImplementation(
      (callback: () => void): NodeJS.Timeout =>
        callback() as unknown as NodeJS.Timeout,
    );

export const approveAndMergePullRequestMutation = (
  mergeMethod: AllowedMergeMethods,
): string => `
  mutation ($commitHeadline: String!, $pullRequestId: ID!) {
    addPullRequestReview(input: {event: APPROVE, pullRequestId: $pullRequestId}) {
      clientMutationId
    }
    mergePullRequest(input: {commitBody: " ", commitHeadline: $commitHeadline, mergeMethod: ${mergeMethod}, pullRequestId: $pullRequestId}) {
      clientMutationId
    }
  }
`;

export const mergePullRequestMutation = (
  mergeMethod: AllowedMergeMethods,
): string => `
  mutation ($commitHeadline: String!, $pullRequestId: ID!) {
    mergePullRequest(input: {commitBody: " ", commitHeadline: $commitHeadline, mergeMethod: ${mergeMethod}, pullRequestId: $pullRequestId}) {
      clientMutationId
    }
  }
`;
