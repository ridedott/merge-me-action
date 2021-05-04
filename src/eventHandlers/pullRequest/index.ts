import { context, getOctokit } from '@actions/github';
import { isMatch } from 'micromatch';

import { getMergeablePullRequestInformationByPullRequestNumber } from '../../common/getPullRequestInformation';
import { tryMerge } from '../../common/merge';
import { logInfo, logWarning } from '../../utilities/log';

export const pullRequestHandle = async (
  octokit: ReturnType<typeof getOctokit>,
  gitHubLogin: string,
  maximumRetries: number,
): Promise<void> => {
  const { pull_request: pullRequest } = context.payload;

  if (pullRequest === undefined) {
    logWarning('Required pull request information is unavailable.');

    return;
  }

  const pullRequestInformation = await getMergeablePullRequestInformationByPullRequestNumber(
    octokit,
    {
      pullRequestNumber: pullRequest.number,
      repositoryName: context.repo.repo,
      repositoryOwner: context.repo.owner,
    },
  );

  if (pullRequestInformation === undefined) {
    logWarning('Unable to fetch pull request information.');
  } else if (isMatch(pullRequestInformation.authorLogin, gitHubLogin)) {
    logInfo(
      `Found pull request information: ${JSON.stringify(
        pullRequestInformation,
      )}.`,
    );

    await tryMerge(octokit, maximumRetries, {
      ...pullRequestInformation,
      commitMessageHeadline: pullRequest.title,
    });
  } else {
    logInfo(
      `Pull request #${pullRequestInformation.pullRequestNumber.toString()} created by ${
        pullRequestInformation.authorLogin
      }, not ${gitHubLogin}, skipping.`,
    );
  }
};
