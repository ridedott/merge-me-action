export const approveAndMergePullRequestMutation = `
  mutation ($commitHeadline: String!, $pullRequestId: ID!) {
    addPullRequestReview(input: {event: APPROVE, pullRequestId: $pullRequestId}) {
      clientMutationId
    }
    mergePullRequest(input: {commitBody: "", commitHeadline: $commitHeadline, mergeMethod: SQUASH, pullRequestId: $pullRequestId}) {
      clientMutationId
    }
  }
`;
