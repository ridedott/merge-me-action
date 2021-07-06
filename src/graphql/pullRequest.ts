export const pullRequestFields = `{
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
  number
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
