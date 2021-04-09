const pullRequestFields = `{
  author {
    login
  }
  commits(last: 1) {
    edges {
      node {
        commit {
          author {
            name
          }
          messageHeadline
          message
        }
      }
    }
  }
  id
  mergeable
  merged
  reviews(last: 1, states: APPROVED) {
    edges {
      node {
        state
      }
    }
  }
  state
  title
}`;

export const findPullRequestsInfoByReferenceName = `
  query FindPullRequestsInfoByReferenceName($repositoryOwner: String!, $repositoryName: String!, $referenceName: String!) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequests(headRefName: $referenceName, first: 1) {
        nodes ${pullRequestFields}
      }
    }
  }
`;

export const findPullRequestInfoByNumber = `
  query FindPullRequestInfoByNumber($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequest(number: $pullRequestNumber) ${pullRequestFields}
    }
  }
`;
