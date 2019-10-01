import { getInput, setFailed, warning } from '@actions/core';
import { context, GitHub } from '@actions/github';

import * as checkSuite from './eventHandlers/checkSuite';
import * as pullRequest from './eventHandlers/pullRequest';
import * as push from './eventHandlers/push';

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');

const octokit = new GitHub(GITHUB_TOKEN);

const main = async (): Promise<void> => {
  console.log(
    context.eventName,
    context.repo,
    JSON.stringify(context.payload, undefined, 2),
  );

  switch (context.eventName) {
    case 'check_suite':
      return checkSuite.handle(octokit);
    case 'pull_request':
      return pullRequest.handle(octokit);
    case 'push':
      return push.handle(octokit);
    default:
      warning(`Unknown event ${context.eventName}, skipping.`);
  }
};

main().catch((error: Error) => {
  setFailed(`An unexpected error occurred: ${error}, ${error.stack}.`);
});
