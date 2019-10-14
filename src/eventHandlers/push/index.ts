import { info, warning } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { DEPENDABOT_GITHUB_LOGIN } from '../../constants';
import { findPullRequestInfoAndReviews } from '../../graphql/queries';
import { mutationSelector } from '../../util';

const COMMIT_HEADLINE_MATCHER = /^(?<commitHeadline>.*)[\s\S]*$/u;
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

export const pushHandle = async (octokit: GitHub): Promise<void> => {
  if (context.payload.pusher.name === DEPENDABOT_GITHUB_LOGIN) {
    try {
      const commitHeadline = getCommitHeadline();
      const referenceName = getReferenceName();
      const repositoryName = context.repo.repo;
      const repositoryOwner = context.repo.owner;

      const {
        repository: {
          pullRequests: {
            nodes: [
              {
                id: pullRequestId,
                mergeable: mergeableState,
                merged,
                reviews: {
                  edges: [reviewEdge],
                },
                state: pullRequestState,
              },
            ],
          },
        },
      } = await octokit.graphql(findPullRequestInfoAndReviews, {
        referenceName,
        repositoryName,
        repositoryOwner,
      });

      info(
        `pushHandle: PullRequestId: ${pullRequestId}, commitHeadline: ${commitHeadline}.`,
      );

      if (
        mergeableState === 'MERGEABLE' &&
        merged === false &&
        pullRequestState === 'OPEN'
      ) {
        await octokit.graphql(mutationSelector(reviewEdge), {
          commitHeadline,
          pullRequestId,
        });
      } else {
        warning('Pull Request is not in a mergeable state');
      }
    } catch (error) {
      warning(error);
      warning(JSON.stringify(error));
    }
  } else {
    info('Pull request not created by Dependabot, skipping.');
  }
};
