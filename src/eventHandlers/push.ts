import { info, warning } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { DEPENDABOT_GITHUB_LOGIN } from '../constants';
import { approveAndMergePullRequestMutation } from '../graphql/mutations';
import { findPullRequestNodeIdByHeadReferenceName } from '../graphql/queries';

const COMMIT_HEADLINE_MATCHER = /^(?<commitHeadline>.*)\n[\s\S]*$/u;
const SHORT_REFERENCE_MATCHER = /^refs\/heads\/(?<name>.*)$/u;

const getCommitHeadline = (): string => {
  const {
    groups: { commitHeadline },
  } = context.payload.commits[0].message.match(COMMIT_HEADLINE_MATCHER);

  return commitHeadline;
};

const getReferenceName = (): string => {
  const {
    groups: { name },
  } = context.payload.ref.match(SHORT_REFERENCE_MATCHER);

  return name;
};

export const handle = async (octokit: GitHub): Promise<void> => {
  if (context.payload.pusher.name === DEPENDABOT_GITHUB_LOGIN) {
    try {
      const commitHeadline = getCommitHeadline();
      const referenceName = getReferenceName();
      const repositoryName = context.repo.repo;
      const repositoryOwner = context.repo.owner;

      const {
        repository: {
          pullRequests: {
            nodes: [{ id: pullRequestId }],
          },
        },
      } = await octokit.graphql(findPullRequestNodeIdByHeadReferenceName, {
        referenceName,
        repositoryName,
        repositoryOwner,
      });

      info(
        `PullRequestId: ${pullRequestId}, commitHeadline: ${commitHeadline}.`,
      );

      await octokit.graphql(approveAndMergePullRequestMutation, {
        commitHeadline,
        pullRequestId,
      });
    } catch (error) {
      warning(error);
      warning(JSON.stringify(error));
    }
  } else {
    info('Pull request not created by Dependabot, skipping.');
  }
};
