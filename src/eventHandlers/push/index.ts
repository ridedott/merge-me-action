import { context, GitHub } from '@actions/github';

import { findPullRequestInfoAndReviews as findPullRequestInformationAndReviews } from '../../graphql/queries';
import {
  CommitMessageHeadlineGroup,
  GroupName,
  PullRequestInformation,
  Repository,
} from '../../types';
import { mutationSelector } from '../../utilities/graphql';
import { logError, logInfo, logWarning } from '../../utilities/log';

const COMMIT_HEADLINE_MATCHER = /^(?<commitHeadline>.*)[\s\S]*$/u;
const SHORT_REFERENCE_MATCHER = /^refs\/heads\/(?<name>.*)$/u;

const getCommitMessageHeadline = (): string => {
  const {
    groups: { commitHeadline },
  } = context.payload.commits[0].message.match(
    COMMIT_HEADLINE_MATCHER,
  ) as CommitMessageHeadlineGroup;

  return commitHeadline;
};

const getReferenceName = (): string => {
  const {
    groups: { name },
  } = context.payload.ref.match(SHORT_REFERENCE_MATCHER) as GroupName;

  return name;
};

const getPullRequestInformation = async (
  octokit: GitHub,
  query: {
    referenceName: string;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformation | undefined> => {
  const response = await octokit.graphql(
    findPullRequestInformationAndReviews,
    query,
  );

  if (
    response === null ||
    response.repository.pullRequests.nodes.length === 0
  ) {
    return undefined;
  }

  const {
    repository: {
      pullRequests: {
        nodes: [
          {
            id: pullRequestId,
            mergeable: mergeableState,
            merged,
            reviews: { edges: reviewEdges },
            state: pullRequestState,
          },
        ],
      },
    },
  } = response as Repository;

  return {
    mergeableState,
    merged,
    pullRequestId,
    pullRequestState,
    reviewEdges,
  };
};

const tryMerge = async (
  octokit: GitHub,
  {
    commitMessageHeadline,
    mergeableState,
    merged,
    pullRequestId,
    pullRequestState,
    reviewEdges,
  }: PullRequestInformation & { commitMessageHeadline: string },
): Promise<void> => {
  if (mergeableState !== 'MERGEABLE') {
    logInfo(`Pull request is not in a mergeable state: ${mergeableState}.`);
  } else if (merged) {
    logInfo(`Pull request is already merged.`);
  } else if (pullRequestState !== 'OPEN') {
    logInfo(`Pull request is not open: ${pullRequestState}.`);
  } else {
    await octokit.graphql(mutationSelector(reviewEdges[0]), {
      commitHeadline: commitMessageHeadline,
      pullRequestId,
    });
  }
};

export const pushHandle = async (
  octokit: GitHub,
  gitHubLogin: string,
): Promise<void> => {
  if (context.payload.pusher.name !== gitHubLogin) {
    logInfo(`Pull request not created by ${gitHubLogin}, skipping.`);

    return;
  }

  try {
    const pullRequestInformation = await getPullRequestInformation(octokit, {
      referenceName: getReferenceName(),
      repositoryName: context.repo.repo,
      repositoryOwner: context.repo.owner,
    });

    if (pullRequestInformation === undefined) {
      logWarning('Unable to fetch pull request information.');
    } else {
      logInfo(
        `Found pull request information: ${JSON.stringify(
          pullRequestInformation,
        )}.`,
      );

      await tryMerge(octokit, {
        ...pullRequestInformation,
        commitMessageHeadline: getCommitMessageHeadline(),
      });
    }
  } catch (error) {
    logError(error);
  }
};
