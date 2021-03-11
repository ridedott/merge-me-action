const pullRequestFields = `{
  commits(last: 1) {
    edges {
      node {
        commit {
          author {
            name
          }
          messageHeadline
          message
          checkSuites {
            edges {
              node {
                checkRuns {
                  edges {
                    node {
                      name
                      status
                      conclusion
                    }
                  }
                }
              }
            }
          }
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
  headRefName
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
