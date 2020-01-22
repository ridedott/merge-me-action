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

export const findPullRequestInfoAndReviews = `
  query FindPullRequestInfoAndReviews($repositoryOwner: String!, $repositoryName: String!, $referenceName: String!) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequests(headRefName: $referenceName, first: 1) {
        nodes {
          reviews(last: 1, states: APPROVED) {
            edges {
              node {
                state
              }
            }
          }
          mergeable
          merged
          state
          id
        }
      }
    }
  }
`;

export const findPullRequestInfo = `
  query FindPullRequestInfo($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequest(number: $pullRequestNumber) {
        reviews(last: 1, states: APPROVED) {
          edges {
            node {
              state
            }
          }
        }
        id
        commits(last: 1) {
          edges {
            node {
              commit {
                message
              }
            }
          }
        }
        mergeable
        merged
        state
      }
    }
  }
`;

export const findPullRequestLastApprovedReview = `
  query FindPullRequestLastApprovedReview($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      pullRequest(number: $pullRequestNumber) {
        reviews(last: 1, states: APPROVED) {
          edges {
            node {
              state
            }
          }
        }
      }
    }
  }
`;
