export declare const findPullRequestNodeIdByPullRequestNumber = "\n  query FindPullRequestNodeId($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!) {\n    repository(owner: $repositoryOwner, name: $repositoryName) {\n      pullRequest(number: $pullRequestNumber) {\n        id\n      }\n    }\n  }\n";
export declare const findPullRequestNodeIdByHeadReferenceName = "\n  query FindPullRequestNodeId($repositoryOwner: String!, $repositoryName: String!, $referenceName: String!) {\n    repository(owner: $repositoryOwner, name: $repositoryName) {\n      pullRequests(headRefName: $referenceName, first: 1) {\n        nodes {\n          id\n        }\n      }\n    }\n  }\n";
export declare const findPullRequestInfoAndReviews = "\n  query FindPullRequestInfoAndReviews($repositoryOwner: String!, $repositoryName: String!, $referenceName: String!) {\n    repository(owner: $repositoryOwner, name: $repositoryName) {\n      pullRequests(headRefName: $referenceName, first: 1) {\n        nodes {\n          reviews(last: 1, states: APPROVED) {\n            edges {\n              node {\n                state\n              }\n            }\n          }\n          mergeable\n          merged\n          state\n          id\n        }\n      }\n    }\n  }\n";
export declare const findPullRequestInfo = "\n  query FindPullRequestInfo($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!) {\n    repository(owner: $repositoryOwner, name: $repositoryName) {\n      pullRequest(number: $pullRequestNumber) {\n        reviews(last: 1, states: APPROVED) {\n          edges {\n            node {\n              state\n            }\n          }\n        }\n        id\n        commits(last: 1) {\n          edges {\n            node {\n              commit {\n                messageHeadline\n                message\n              }\n            }\n          }\n        }\n        mergeable\n        merged\n        state\n      }\n    }\n  }\n";
export declare const findPullRequestLastApprovedReview = "\n  query FindPullRequestLastApprovedReview($repositoryOwner: String!, $repositoryName: String!, $pullRequestNumber: Int!) {\n    repository(owner: $repositoryOwner, name: $repositoryName) {\n      pullRequest(number: $pullRequestNumber) {\n        reviews(last: 1, states: APPROVED) {\n          edges {\n            node {\n              state\n            }\n          }\n        }\n      }\n    }\n  }\n";
//# sourceMappingURL=queries.d.ts.map