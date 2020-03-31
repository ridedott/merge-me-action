import { AllowedMergeMethods } from '../utilities/inputParsers';

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
