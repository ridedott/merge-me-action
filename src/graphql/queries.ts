export const findPullRequestNodeIdByPullRequestNumber = `
  query FindPullRequestNodeId($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequest(number: $pullRequestNumber) {
        id
      }
    }
  }
`;

export const findPullRequestNodeIdByHeadReferenceName = `
  query FindPullRequestNodeId($repositoryOwner: String!, $repositoryName: String!, $referenceName: String!) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequests(headRefName: $referenceName, first: 1) {
        nodes {
          id
        }
      }
    }
  }
`;
