export const mergePullRequestQuery = `
  mutation($pullRequestId: ID!) {
    mergePullRequest(input: {mergeMethod: SQUASH, pullRequestId: $pullRequestId}) {
      clientMutationId
    }
  }
`;
