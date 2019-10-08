import { info, warning } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { DEPENDABOT_GITHUB_LOGIN } from '../../constants';
import { approveAndMergePullRequestMutation } from '../../graphql/mutations';

export const pullRequestHandle = async (octokit: GitHub): Promise<void> => {
  const pullRequest = context.payload.pull_request;

  if (pullRequest === undefined) {
    warning('Pull request information is unavailable.');
  } else if (pullRequest.user.login === DEPENDABOT_GITHUB_LOGIN) {
    try {
      const commitHeadline = pullRequest.title;
      const pullRequestId = pullRequest.node_id;

      info(
        `pullRequestHandle: PullRequestId: ${pullRequestId}, commitHeadline: ${commitHeadline}.`,
      );

      await octokit.graphql(approveAndMergePullRequestMutation, {
        commitHeadline: pullRequest.title,
        pullRequestId: pullRequest.node_id,
      });
    } catch (error) {
      warning(error);
      warning(JSON.stringify(error));
    }
  } else {
    info('Pull request not created by Dependabot, skipping.');
  }
};
