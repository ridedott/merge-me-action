import { getInput, setFailed, warning } from '@actions/core';
import { context, GitHub } from '@actions/github';

import {
  checkSuiteHandle,
  pullRequestHandle,
  pushHandle,
} from './eventHandlers';

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');

const octokit = new GitHub(GITHUB_TOKEN);

const main = async (): Promise<void> => {
  switch (context.eventName) {
    case 'check_suite':
      return checkSuiteHandle(octokit);
    case 'pull_request':
      return pullRequestHandle(octokit);
    case 'push':
      return pushHandle(octokit);
    default:
      warning(`Unknown event ${context.eventName}, skipping.`);
  }
};

main().catch((error: Error): void => {
  setFailed(`An unexpected error occurred: ${error}, ${error.stack}.`);
});
