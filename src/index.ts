import { getInput, setFailed, warning } from '@actions/core';
import { info } from '@actions/core/lib/core';
import { context, GitHub } from '@actions/github';

import {
  checkSuiteHandle,
  pullRequestHandle,
  pushHandle,
} from './eventHandlers';

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');

const octokit = new GitHub(GITHUB_TOKEN);
const BOT_NAME = getInput('BOT_NAME');

const main = async (): Promise<void> => {
  info(`The bot name is ${BOT_NAME}`);

  switch (context.eventName) {
    case 'check_suite':
      return checkSuiteHandle(octokit, BOT_NAME);
    case 'pull_request':
      return pullRequestHandle(octokit, BOT_NAME);
    case 'push':
      return pushHandle(octokit, BOT_NAME);
    default:
      warning(`Unknown event ${context.eventName}, skipping.`);
  }
};

main().catch((error: Error): void => {
  setFailed(
    `An unexpected error occurred: ${error.message}, ${error.stack ??
      'no stack trace'}.`,
  );
});
