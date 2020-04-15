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
  mergeableState: MergeableState;
  merged: boolean;
  pullRequestId: string;
  pullRequestState: PullRequestState;
  reviewEdges: ReviewEdges;
}

export interface Repository {
  repository: {
    pullRequests: {
      nodes: Array<{
        id: string;
        mergeable: MergeableState;
        merged: boolean;
        reviews: {
          edges: ReviewEdges;
        };
        state: PullRequestState;
      }>;
    };
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
