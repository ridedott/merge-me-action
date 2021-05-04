import { context, getOctokit } from '@actions/github';

import { tryMerge } from '../../common/merge';
import { findPullRequestsInfoByReferenceName } from '../../graphql/queries';
import {
  CommitMessageHeadlineGroup,
  FindPullRequestsInfoByReferenceNameResponse,
  GroupName,
  PullRequestInformationContinuousIntegrationEnd,
} from '../../types';
import { logInfo, logWarning } from '../../utilities/log';

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
  octokit: ReturnType<typeof getOctokit>,
  query: {
    referenceName: string;
    repositoryName: string;
    repositoryOwner: string;
  },
): Promise<PullRequestInformationContinuousIntegrationEnd | undefined> => {
  const response = await octokit.graphql(
    findPullRequestsInfoByReferenceName,
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
            commits: {
              edges: [
                {
                  node: {
                    commit: {
                      author: { name: commitAuthorName },
                      message: commitMessage,
                      messageHeadline: commitMessageHeadline,
                    },
                  },
                },
              ],
            },
            reviews: { edges: reviewEdges },
            mergeStateStatus,
            mergeable: mergeableState,
            merged,
            state: pullRequestState,
            title: pullRequestTitle,
          },
        ],
      },
    },
  } = response as FindPullRequestsInfoByReferenceNameResponse;

  return {
    commitAuthorName,
    commitMessage,
    commitMessageHeadline,
    mergeStateStatus,
    mergeableState,
    merged,
    pullRequestId,
    pullRequestState,
    pullRequestTitle,
    reviewEdges,
  };
};

export const pushHandle = async (
  octokit: ReturnType<typeof getOctokit>,
  gitHubLogin: string,
  maximumRetries: number,
): Promise<void> => {
  if (context.payload.pusher.name !== gitHubLogin) {
    logInfo(
      `Pull request created by ${
        context.payload.pusher.name as string
      }, not ${gitHubLogin}, skipping.`,
    );

    return;
  }

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

    await tryMerge(octokit, maximumRetries, {
      ...pullRequestInformation,
      commitMessageHeadline: getCommitMessageHeadline(),
    });
  }
};
