export interface CommitMessageHeadlineGroup {
  groups: {
    commitHeadline: string;
  };
}

export interface GroupName {
  groups: {
    name: string;
  };
}

export type ReviewEdges = Array<
  | {
      node: {
        state:
          | 'APPROVED'
          | 'CHANGES_REQUESTED'
          | 'COMMENTED'
          | 'DISMISSED'
          | 'PENDING';
      };
    }
  | undefined
>;

export interface PullRequestInformation {
  commitAuthorName: string;
  commitMessage: string;
  commitMessageHeadline: string;
  mergeStateStatus?: MergeStateStatus;
  mergeableState: MergeableState;
  merged: boolean;
  pullRequestId: string;
  pullRequestState: PullRequestState;
  pullRequestTitle: string;
  reviewEdges: ReviewEdges;
}

interface PullRequest {
  commits: {
    edges: Array<{
      node: {
        commit: {
          author: {
            name: string;
          };
          message: string;
          messageHeadline: string;
        };
      };
    }>;
  };
  id: string;
  mergeStateStatus?: MergeStateStatus;
  mergeable: MergeableState;
  merged: boolean;
  reviews: { edges: ReviewEdges };
  state: PullRequestState;
  title: string;
}

export interface FindPullRequestsInfoByReferenceNameResponse {
  repository: {
    pullRequests: {
      nodes: PullRequest[];
    };
  };
}

export interface FindPullRequestInfoByNumberResponse {
  repository: {
    pullRequest: PullRequest;
  };
}

export type MergeableState = 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN';

export type PullRequestState = 'CLOSED' | 'MERGED' | 'OPEN';

export type MergeStateStatus =
  | 'BEHIND'
  | 'BLOCKED'
  | 'CLEAN'
  | 'DIRTY'
  | 'DRAFT'
  | 'HAS_HOOKS'
  | 'UNKNOWN'
  | 'UNSTABLE';
