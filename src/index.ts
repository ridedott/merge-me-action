import { getInput, setFailed } from '@actions/core';
import { context, GitHub } from '@actions/github';

import {
  checkSuiteHandle,
  pullRequestHandle,
  pushHandle,
} from './eventHandlers';
import { logInfo, logWarning } from './utilities/log';

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
const GITHUB_LOGIN = getInput('GITHUB_LOGIN');

const octokit = new GitHub(GITHUB_TOKEN);

const main = async (): Promise<void> => {
  logInfo(`Automatic merges enabled for GitHub login: ${GITHUB_LOGIN}.`);

  switch (context.eventName) {
    case 'check_suite':
      return checkSuiteHandle(octokit, GITHUB_LOGIN);
    case 'pull_request':
      return pullRequestHandle(octokit, GITHUB_LOGIN);
    case 'push':
      return pushHandle(octokit, GITHUB_LOGIN);
    default:
      logWarning(`Unknown event ${context.eventName}, skipping.`);
  }
};

main().catch((error: Error): void => {
  setFailed(
    `An unexpected error occurred: ${error.message}, ${
      error.stack ?? 'no stack trace'
    }.`,
  );
});
