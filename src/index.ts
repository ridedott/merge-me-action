import { getInput, setFailed } from '@actions/core';
import { context, GitHub } from '@actions/github';

import { mergePullRequestQuery } from './queries';

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');

const octokit = new GitHub(GITHUB_TOKEN);

const maybeGetPullRequestNodeId = (): string | undefined => {
  const pullRequestContext = context.payload.pull_request;

  return typeof pullRequestContext === 'object'
    ? pullRequestContext.node_id
    : undefined;
};

const main = async (): Promise<void> => {
  console.log(JSON.stringify(context.payload, undefined, 2));

  const maybePullRequestNodeId = maybeGetPullRequestNodeId();

  if (typeof maybePullRequestNodeId === 'string' && false) {
    await octokit.graphql(mergePullRequestQuery, {
      pullRequestId: maybePullRequestNodeId,
    });
  }
};

main().catch((error: Error) => {
  setFailed(`An unexpected error occurred: ${error}.`);
});
